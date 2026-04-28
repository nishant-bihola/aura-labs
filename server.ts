import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { Client as NotionClient } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);
const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN 
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- EMAIL TEMPLATES (PREMIUM) ---

const generateBaseTemplate = (content: string, accentColor: string = "#00F0FF") => `
  <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a;">
    <div style="margin-bottom: 40px; text-align: center;">
      <span style="background: linear-gradient(90deg, ${accentColor}, #0077FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
    </div>
    ${content}
    <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center; margin-top: 40px;">
      © 2026 Aura Labs • Edmonton, Alberta • System Transmission
    </div>
  </div>
`;

const generateContactEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => `
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New ${type} Submission</h2>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
    <p style="margin: 10px 0;"><strong>Client:</strong> ${name}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
    ${plan ? `<p style="margin: 10px 0;"><strong>Interested Plan:</strong> <span style="color: #00F0FF;">${plan}</span></p>` : ""}
  </div>
  <div style="padding: 20px; border-left: 2px solid #00F0FF; background: #050505;">
    <p style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Message Content</p>
    <p style="font-size: 16px; line-height: 1.6; color: #ddd; margin: 0;">${message}</p>
  </div>
`;

const generateUserThankYouHTML = (name: string) => generateBaseTemplate(`
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Transmission Received.</h2>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 20px;">
    Greetings, ${name.split(' ')[0]}. We've successfully captured your project details.
  </p>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
    Our team is currently reviewing your vision. Expect a detailed response from one of our lead architects within <span style="color: #00F0FF;">24-48 hours</span>.
  </p>
`);

const generateBookingConfirmationHTML = (name: string, date: string, time: string) => generateBaseTemplate(`
  <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Consultation Secured.</h1>
  <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 30px;">
    Hi ${name.split(' ')[0]}, your architectural session has been successfully added to our grid.
  </p>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 40px; text-align: left;">
    <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</strong><br/><span style="font-size: 18px;">${date}</span></div>
    <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</strong><br/><span style="font-size: 18px;">${time} (Edmonton Time)</span></div>
    <div><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Protocol</strong><br/><span style="font-size: 18px;">Virtual Interface / Google Meet</span></div>
  </div>
  <p style="font-size: 14px; color: #404040;">
    A direct calendar invitation with the access link will be transmitted shortly.
  </p>
`, "#00FF94");

// --- SERVER LOGIC ---

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => res.status(200).json({ status: "online", version: "1.0.0" }));

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, type, plan } = req.body;
    const inquiryType = type || "Contact";
    
    try {
      // 1. Store in Supabase
      await supabase.from("contact_submissions").insert([{ 
        first_name: name.split(' ')[0], 
        last_name: name.split(' ').slice(1).join(' '), 
        email, 
        message, 
        type: inquiryType,
        plan: plan
      }]);

      // 2. Respond immediately
      res.status(200).json({ success: true });

      // 3. Background Tasks (Emails & Notion)
      (async () => {
        try {
          const tasks = [];

          // Admin Notification
          tasks.push(resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
            to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
            reply_to: email,
            subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
            html: generateBaseTemplate(generateContactEmailHTML(name, email, message, inquiryType, plan)),
          }));

          // User Thank You / Newsletter Welcome
          if (inquiryType === "Newsletter") {
            tasks.push(resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
              to: email,
              subject: "Welcome to The Journal | Aura Labs",
              html: generateBaseTemplate(`
                <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Welcome to the Inner Circle</h1>
                <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
                  Your subscription to <span style="color: #00F0FF;">The Journal</span> is confirmed. You'll receive our deep dives into the future of digital residency.
                </p>
              `)
            }));
          } else {
            tasks.push(resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
              to: email,
              subject: "Transmission Received | Aura Labs",
              html: generateUserThankYouHTML(name)
            }));
          }

          // Notion Sync
          if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
            tasks.push(notion.pages.create({
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

          await Promise.allSettled(tasks);
        } catch (err) {
          console.error("Background tasks failed:", err);
        }
      })();
    } catch (error) {
      console.error("Contact API Error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for Booking
  app.post("/api/book", async (req, res) => {
    const { name, email, date, time } = req.body;
    
    try {
      await supabase.from("bookings").insert([{ name, email, date, time }]);
      res.status(200).json({ success: true });

      (async () => {
        try {
          await Promise.allSettled([
            resend.emails.send({
              from: "Aura Labs <onboarding@resend.dev>",
              to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
              reply_to: email,
              subject: `NEW CALL BOOKED: ${name} on ${date}`,
              html: generateBaseTemplate(`
                <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New Consultation Secured</h2>
                <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a;">
                  <p><strong>Client:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Scheduled:</strong> ${date} at ${time}</p>
                </div>
              `, "#00FF94"),
            }),
            resend.emails.send({
              from: "Aura Labs <onboarding@resend.dev>",
              to: email,
              subject: "Consultation Confirmed | Aura Labs",
              html: generateBookingConfirmationHTML(name, date, time),
            })
          ]);
        } catch (err) {
          console.error("Booking email tasks failed:", err);
        }
      })();
    } catch (error) {
      console.error("Booking API Error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n>> AURA LABS FULL-STACK ENGINE ONLINE`);
    console.log(`>> Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`>> Address: http://localhost:${PORT}\n`);
  });
}

startServer();
