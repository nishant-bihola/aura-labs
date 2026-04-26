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
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 50px; border-radius: 30px; border: 1px solid #1a1a1a; line-height: 1.6;">
    <div style="margin-bottom: 30px; border-left: 2px solid #00F0FF; padding-left: 20px;">
      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-style: italic; font-weight: 300;">Aura Labs</h1>
      <p style="color: #00F0FF; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin: 5px 0 0;">Cinematic Digital Solutions</p>
    </div>
    
    <h2 style="font-size: 24px; font-weight: 300; margin-bottom: 25px;">Hello ${name},</h2>
    
    <p style="color: #888; font-size: 16px; margin-bottom: 25px;">
      Thank you for reaching out. We have successfully received your inquiry for <strong>${inquiryType}</strong>.
    </p>
    
    <p style="color: #888; font-size: 16px; margin-bottom: 25px;">
      Our team of architects and designers is currently reviewing your project brief. You can expect a response from us within <span style="color: #ffffff;">24 hours</span> to discuss the next steps in bringing your vision to life.
    </p>
    
    <div style="background: #0a0a0a; border: 1px solid #1a1a1a; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Immediate Next Step</p>
      <p style="margin: 0; color: #ffffff; font-size: 14px;">Keep an eye on your inbox for a direct invitation to a discovery call.</p>
    </div>
    
    <p style="color: #444; font-size: 14px; margin-bottom: 0;">Warm regards,</p>
    <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 5px;">The Aura Labs Team</p>
    
    <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #1a1a1a; text-align: center;">
      <p style="color: #333; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
        auralabs.io • London • NYC • Global
      </p>
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, type, plan } = req.body;
    const inquiryType = type || "Contact";
    console.log(`${inquiryType} request received:`, { name, email, message, plan });

    const adminEmailOptions = {
      from: `Aura Labs <onboarding@resend.dev>`,
      to: process.env.ADMIN_EMAIL || "",
      reply_to: process.env.EMAIL_USER,
      subject: `New ${inquiryType} Submission from ${name}`,
      html: generateEmailHTML(name, email, message, inquiryType as any, plan),
    };

    try {
      const results = { supabase: false, notion: false, ownerEmail: false, clientEmail: false };

      // 1. Store in Supabase
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
      } else {
        results.supabase = true;
      }

      // 2. Sync to Notion
      if (process.env.NOTION_DATABASE_ID) {
        try {
          await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
              Name: { title: [{ text: { content: name } }] },
              Email: { email: email },
              Message: { rich_text: [{ text: { content: message } }] },
              Type: { select: { name: inquiryType } },
              ...(plan && { Plan: { select: { name: plan } } }),
              Date: { date: { start: new Date().toISOString() } }
            }
          });
          results.notion = true;
        } catch (err) {
          console.error("Notion Error:", err);
        }
      }

      // 3. Send Admin Notification
      if (inquiryType !== "Newsletter") {
        await resend_email.emails.send(adminEmailOptions);
      } else {
        await resend_email.emails.send({
          from: `Aura Labs <onboarding@resend.dev>`,
          to: process.env.ADMIN_EMAIL || "",
          subject: `New Newsletter Subscriber: ${email}`,
          html: `<h1>New Subscriber</h1><p>${email} has joined the newsletter.</p>`,
        });
      }
      results.ownerEmail = true;

      // 4. Send Client Confirmation
      if (inquiryType === "Newsletter") {
        await resend_email.emails.send({
          from: `Aura Labs <onboarding@resend.dev>`,
          to: email,
          reply_to: process.env.EMAIL_USER,
          subject: "Welcome to Aura Labs Journal",
          html: generateNewsletterWelcomeHTML(email),
        });
      } else {
        await resend_email.emails.send({
          from: `Aura Labs <onboarding@resend.dev>`,
          to: email,
          reply_to: process.env.EMAIL_USER,
          subject: "We received your inquiry!",
          html: generateClientConfirmationHTML(name.split(' ')[0], plan ? `${plan} Inquiry` : "Digital Solution Inquiry"),
        });
      }
      results.clientEmail = true;

      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error("Submission Error:", error);
      res.status(500).json({ success: false, error: "Submission failed" });
    }
  });

  // ADMIN: Get all submissions from Supabase
  app.get("/api/admin/submissions", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // ADMIN: Get sent email logs from Resend
  app.get("/api/admin/emails", async (req, res) => {
    try {
      const { data, error } = await resend_email.emails.list();
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email logs" });
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
