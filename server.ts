import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { Client as NotionClient } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN 
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend_email = new Resend(process.env.RESEND_API_KEY);

const generateClientConfirmationHTML = (name: string, inquiryType: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 40px; border: 1px solid #1a1a1a; line-height: 1.6;">
    <div style="margin-bottom: 40px; border-left: 2px solid #00F0FF; padding-left: 25px;">
      <h1 style="color: #ffffff; font-size: 36px; margin: 0; font-style: italic; font-weight: 300; letter-spacing: -1px;">Aura Labs</h1>
      <p style="color: #00F0FF; font-size: 11px; text-transform: uppercase; letter-spacing: 5px; margin: 8px 0 0; font-weight: bold;">Innovation Studio</p>
    </div>
    
    <h2 style="font-size: 26px; font-weight: 300; margin-bottom: 30px; color: #ffffff;">Thank you, ${name}.</h2>
    
    <p style="color: #999; font-size: 17px; margin-bottom: 30px;">
      We have successfully received your inquiry for <strong style="color: #ffffff;">${inquiryType}</strong>. 
    </p>
    
    <p style="color: #999; font-size: 17px; margin-bottom: 35px;">
      Our studio architects are currently reviewing your project details. We prioritize every vision we receive and will be in touch within <span style="color: #ffffff; font-weight: bold;">24 hours</span> to discuss how we can bring yours to life.
    </p>
    
    <div style="background: linear-gradient(145deg, #0a0a0a 0%, #111 100%); border: 1px solid #222; padding: 30px; border-radius: 25px; margin-bottom: 40px;">
      <p style="margin: 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; font-weight: 800;">Expedite Your Vision</p>
      <p style="margin: 0; color: #ffffff; font-size: 15px; margin-bottom: 25px; font-weight: 300;">Would you like to discuss your project immediately? Secure a slot on our architectural calendar below.</p>
      <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/YOUR_GOOGLE_CALENDAR_LINK" style="display: inline-block; background: #ffffff; color: #000000; text-decoration: none; padding: 14px 30px; border-radius: 100px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s ease;">Book Discovery Call</a>
    </div>
    
    <div style="border-top: 1px solid #1a1a1a; padding-top: 40px; margin-top: 40px;">
      <p style="color: #555; font-size: 14px; margin-bottom: 5px;">Best regards,</p>
      <p style="color: #ffffff; font-size: 18px; font-weight: 400; font-style: italic; margin-top: 0;">The Aura Labs Studio Team</p>
    </div>
    
    <div style="margin-top: 60px; text-align: center;">
      <p style="color: #333; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0; font-weight: bold;">
        London • NYC • Zurich • Global
      </p>
    </div>
  </div>
`;

const generateBookingConfirmationHTML = (name: string, date: string, time: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 40px; border: 1px solid #1a1a1a; line-height: 1.6;">
    <div style="margin-bottom: 40px; border-left: 2px solid #00FF94; padding-left: 25px;">
      <h1 style="color: #ffffff; font-size: 36px; margin: 0; font-style: italic; font-weight: 300; letter-spacing: -1px;">Aura Labs</h1>
      <p style="color: #00FF94; font-size: 11px; text-transform: uppercase; letter-spacing: 5px; margin: 8px 0 0; font-weight: bold;">Architectural Consultation</p>
    </div>
    
    <h2 style="font-size: 26px; font-weight: 300; margin-bottom: 30px; color: #ffffff;">Confirmed, ${name}.</h2>
    
    <p style="color: #999; font-size: 17px; margin-bottom: 30px;">
      Your discovery call has been successfully scheduled. We have reserved this slot specifically for your project vision.
    </p>
    
    <div style="background: #0a0a0a; border: 1px solid #222; padding: 30px; border-radius: 25px; margin-bottom: 40px;">
      <div style="margin-bottom: 20px;">
        <p style="margin: 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 5px; font-weight: 800;">Date</p>
        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 300;">${date}</p>
      </div>
      <div>
        <p style="margin: 0; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 5px; font-weight: 800;">Time</p>
        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 300;">${time} (Mountain Time / Edmonton)</p>
      </div>
    </div>
    
    <p style="color: #999; font-size: 17px; margin-bottom: 35px;">
      A Google Meet link will be sent to your calendar shortly. Please ensure you have any relevant project assets or references ready for discussion.
    </p>
    
    <div style="border-top: 1px solid #1a1a1a; padding-top: 40px; margin-top: 40px;">
      <p style="color: #555; font-size: 14px; margin-bottom: 5px;">Best regards,</p>
      <p style="color: #ffffff; font-size: 18px; font-weight: 400; font-style: italic; margin-top: 0;">The Aura Labs Studio Team</p>
    </div>
  </div>
`;

const generateEmailHTML = (name: string, email: string, message: string, type: "Contact" | "Pricing Lead" | "Newsletter" | "Project Inquiry", plan?: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
    <h2 style="color: #00F0FF; font-size: 24px; margin-bottom: 20px;">New ${type} received</h2>
    <div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
      ${plan ? `<p style="margin: 10px 0;"><strong>Interested Plan:</strong> ${plan}</p>` : ""}
    </div>
    <div style="border-top: 1px solid #333; padding-top: 20px;">
      <p style="color: #888; font-size: 14px; margin-bottom: 10px;">Message:</p>
      <p style="font-size: 16px; line-height: 1.6; color: #ddd;">${message}</p>
    </div>
    <div style="margin-top: 40px; text-align: center; color: #444; font-size: 12px;">
      © 2026 Aura Labs • Premium Digital Solutions
    </div>
  </div>
`;

const generateNewsletterWelcomeHTML = (email: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 50px; border-radius: 30px; border: 1px solid #1a1a1a; line-height: 1.6;">
    <div style="margin-bottom: 30px; border-left: 2px solid #BD00FF; padding-left: 20px;">
      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-style: italic; font-weight: 300;">Aura Labs</h1>
      <p style="color: #BD00FF; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin: 5px 0 0;">The Digital Journal</p>
    </div>
    <h2 style="font-size: 24px; font-weight: 300; margin-bottom: 25px;">You're in.</h2>
    <p style="color: #888; font-size: 16px; margin-bottom: 25px;">
      Thank you for subscribing to the Aura Labs newsletter. You'll now receive exclusive insights into our latest architectural designs, digital innovations, and behind-the-scenes content from our global studios.
    </p>
    <div style="background: #0a0a0a; border: 1px solid #1a1a1a; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Coming Soon</p>
      <p style="margin: 0; color: #ffffff; font-size: 14px;">"The Future of Spatial UI" — A deep dive into our work with Nero Vision.</p>
    </div>
    <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 5px;">Aura Labs Editorial</p>
  </div>
`;

const convert12hTo24h = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString().padStart(2, '0');
  }
  return `${hours.padStart(2, '0')}${minutes}00`;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, type, plan } = req.body;
    const inquiryType = type || "Contact";
    
    try {
      // 1. Store in Supabase FIRST (Essential data safety)
      const { error: supabaseError } = await supabase
        .from("contact_submissions")
        .insert([{ 
          first_name: name.split(' ')[0], 
          last_name: name.split(' ').slice(1).join(' '), 
          email, 
          message, 
          type: inquiryType,
          plan: plan
        }]);

      if (supabaseError) {
        console.error("Supabase Error:", supabaseError);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // 2. RESPOND TO CLIENT IMMEDIATELY (Ultra fast feel)
      res.status(200).json({ success: true });

      // 3. TRIGGER BACKGROUND TASKS (Emails & Notion)
      (async () => {
        try {
          const emailTasks = [];

          // Admin Notification (Always Send)
          emailTasks.push(resend_email.emails.send({
            from: `Aura Labs <onboarding@resend.dev>`,
            to: process.env.ADMIN_EMAIL || "",
            reply_to: email,
            subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
            html: generateEmailHTML(name, email, message, inquiryType as any, plan),
          }));

          // Client Confirmation (Only send if it's the verified admin email)
          // NOTE: On Resend Free Tier (Sandbox), you can only send to your own email.
          if (email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase()) {
            if (inquiryType === "Newsletter") {
              emailTasks.push(resend_email.emails.send({
                from: `Aura Labs <onboarding@resend.dev>`,
                to: email,
                reply_to: process.env.ADMIN_EMAIL,
                subject: "Welcome to Aura Labs Journal",
                html: generateNewsletterWelcomeHTML(email),
              }));
            } else {
              emailTasks.push(resend_email.emails.send({
                from: `Aura Labs <onboarding@resend.dev>`,
                to: email,
                reply_to: process.env.ADMIN_EMAIL,
                subject: "We received your inquiry!",
                html: generateClientConfirmationHTML(name.split(' ')[0], plan ? `${plan} Inquiry` : "Digital Solution Inquiry"),
              }));
            }
          } else {
            console.log(`Bypassing client confirmation for ${email} due to Resend Sandbox restrictions.`);
          }

          // Notion Sync
          if (process.env.NOTION_DATABASE_ID) {
            emailTasks.push(notion.pages.create({
              parent: { database_id: process.env.NOTION_DATABASE_ID },
              properties: {
                Name: { title: [{ text: { content: name } }] },
                Email: { email: email },
                Message: { rich_text: [{ text: { content: message } }] },
                Type: { select: { name: inquiryType } },
                ...(plan && { Plan: { select: { name: plan } } }),
                Date: { date: { start: new Date().toISOString() } }
              }
            }));
          }

          await Promise.allSettled(emailTasks);
          console.log(`Background tasks completed for ${email}`);
        } catch (bgError) {
          console.error("Background Task Error:", bgError);
        }
      })();

    } catch (error) {
      console.error("Submission Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Submission failed" });
      }
    }
  });

  // API Route for Booking
  app.post("/api/book", async (req, res) => {
    const { name, email, date, time } = req.body;
    
    try {
      // 1. Store in Supabase
      const { error: supabaseError } = await supabase
        .from("bookings")
        .insert([{ name, email, date, time }]);

      if (supabaseError) {
        console.error("Supabase Booking Error:", supabaseError);
        return res.status(500).json({ success: false, error: "Database error", details: supabaseError.message });
      }

      // 2. Respond immediately
      res.status(200).json({ success: true });

      // 3. Background Emails
      (async () => {
        try {
          await Promise.allSettled([
            // Admin Notification (Always Send)
            resend_email.emails.send({
              from: `Aura Labs <onboarding@resend.dev>`,
              to: process.env.ADMIN_EMAIL || "",
              reply_to: email,
              subject: `NEW CALL BOOKED: ${name} on ${date}`,
              html: `
                <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
                  <h2 style="color: #00FF94; font-style: italic;">New Architectural Consultation Booked</h2>
                  <div style="background: #111; padding: 20px; border-radius: 12px; margin-top: 20px;">
                    <p><strong>Client:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Scheduled:</strong> ${date} at ${time} (Edmonton Time)</p>
                  </div>
                  
                  <div style="margin-top: 30px;">
                    <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=Architectural+Consultation+-+${encodeURIComponent(name)}&details=Aura+Labs+Consultation+with+${encodeURIComponent(name)}&location=Virtual&dates=${date.replace(/-/g, '')}T${convert12hTo24h(time)}/${date.replace(/-/g, '')}T${(parseInt(convert12hTo24h(time).substring(0,2)) + 1).toString().padStart(2, '0')}${convert12hTo24h(time).substring(2)}" 
                       style="background: #ffffff; color: #000; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">
                       Add to Google Calendar
                    </a>
                  </div>
                  
                  <p style="margin-top: 40px; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px;">Stored in Supabase CRM • Aura Labs System</p>
                </div>
              `,
            }),
            // Client Confirmation (Only if verified)
            ...(email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase() ? [
              resend_email.emails.send({
                from: `Aura Labs <onboarding@resend.dev>`,
                to: email,
                reply_to: process.env.ADMIN_EMAIL,
                subject: "Discovery Call Confirmed - Aura Labs",
                html: generateBookingConfirmationHTML(name.split(' ')[0], date, time),
              })
            ] : [])
          ]);
          console.log(`Booking emails sent for ${email}`);
        } catch (err) {
          console.error("Booking Email Error:", err);
        }
      })();


    } catch (error) {
      console.error("Booking Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Booking failed" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
