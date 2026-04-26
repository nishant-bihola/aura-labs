import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateClientConfirmationHTML = (name: string, type: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #111; padding: 40px; border-radius: 20px; border: 1px solid #eee; line-height: 1.6;">
    <h1 style="color: #000; font-size: 28px; margin-bottom: 20px;">We've received your request</h1>
    <p>Hello ${name},</p>
    <p>Thank you for reaching out to <strong>Aura Labs</strong>. We have received your inquiry for <strong>${type}</strong>.</p>
    <p>Our team is currently reviewing your details and we will get back to you within 24 hours to schedule a discovery call.</p>
    <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; border-left: 4px solid #00F0FF;">
      <p style="margin: 0; font-size: 14px; color: #555;">Next Steps:</p>
      <p style="margin: 5px 0 0; font-weight: bold;">Keep an eye on your inbox for a calendar invite.</p>
    </div>
    <p>Best regards,<br><strong>Aura Labs Team</strong></p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #aaa; font-size: 12px;">
      aura-labs.com • Premium Digital Solutions
    </div>
  </div>
`;

const generateEmailHTML = (name: string, email: string, message: string, type: "Contact" | "Pricing Lead", plan?: string) => `
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    console.log("Contact request received:", { name, email, message });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: generateEmailHTML(name, email, message, "Contact"),
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
          type: "Contact" 
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
              Type: { select: { name: "Contact" } },
              Date: { date: { start: new Date().toISOString() } }
            }
          });
          results.notion = true;
        } catch (err) {
          console.error("Notion Error:", err);
        }
      }

      // 3. Send Admin Notification
      await transporter.sendMail(mailOptions);
      results.ownerEmail = true;

      // 4. Send Client Confirmation
      await transporter.sendMail({
        from: `"Aura Labs" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We received your inquiry!",
        html: generateClientConfirmationHTML(name.split(' ')[0], "Digital Solution Inquiry"),
      });
      results.clientEmail = true;

      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error("Submission Error:", error);
      res.status(500).json({ success: false, error: "Submission failed" });
    }
  });

  // API Route for Pricing Leads
  app.post("/api/pricing-lead", async (req, res) => {
    const { plan, email, name } = req.body;
    console.log("Pricing lead received:", { plan, email, name });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Pricing Lead: ${plan} plan`,
      html: generateEmailHTML(name, email, `Interested in the ${plan} plan.`, "Pricing Lead", plan),
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
          message: `Interested in the ${plan} plan.`, 
          type: "Pricing Lead",
          plan 
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
              Message: { rich_text: [{ text: { content: `Interested in ${plan} plan.` } }] },
              Type: { select: { name: "Pricing Lead" } },
              Plan: { select: { name: plan } },
              Date: { date: { start: new Date().toISOString() } }
            }
          });
          results.notion = true;
        } catch (err) {
          console.error("Notion Error:", err);
        }
      }

      // 3. Send Admin Notification
      await transporter.sendMail(mailOptions);
      results.ownerEmail = true;

      // 4. Send Client Confirmation
      await transporter.sendMail({
        from: `"Aura Labs" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your ${plan} Plan Inquiry`,
        html: generateClientConfirmationHTML(name.split(' ')[0], `${plan} Plan Inquiry`),
      });
      results.clientEmail = true;

      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error("Pricing Lead Error:", error);
      res.status(500).json({ success: false, error: "Failed to process lead" });
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
