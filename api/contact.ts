import { Resend } from "resend";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { Client as NotionClient } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Configure Services
const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "nishant15bihola@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN 
});

const generateBaseTemplate = (content: string, accentColor: string = "#00F0FF") => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
      body { margin: 0; padding: 0; background-color: #000000; }
    </style>
  </head>
  <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8);">
      <div style="padding: 60px 50px;">
        <div style="margin-bottom: 50px; text-align: center;">
          <div style="display: inline-block; padding: 2px; background: linear-gradient(90deg, ${accentColor}, #0077FF); border-radius: 10px;">
            <div style="background: #000; padding: 10px 20px; border-radius: 8px;">
               <span style="color: #fff; font-weight: 800; font-size: 16px; letter-spacing: 4px; text-transform: uppercase;">AURA LABS</span>
            </div>
          </div>
        </div>
        ${content}
        <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <p style="color: rgba(255,255,255,0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Transmission Secure • Edmonton, AB • © 2026
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

const generateContactEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => {
  const meetLink = process.env.GOOGLE_MEET_LINK || "https://meet.google.com/aura-labs-consult";
  return `
    <h2 style="color: #ffffff; font-size: 32px; margin-bottom: 30px; font-weight: 800; letter-spacing: -1.5px; line-height: 1;">New ${type} <br/>Arrival Detected.</h2>
    
    <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 30px;">
      <div style="margin-bottom: 25px;">
        <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Identity</p>
        <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">${name}</p>
      </div>
      <div style="margin-bottom: 25px;">
        <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Connection</p>
        <p style="color: #00F0FF; font-size: 16px; margin: 0;">${email}</p>
      </div>
      ${plan ? `
      <div>
        <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Target Configuration</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${plan} Plan</p>
      </div>` : ""}
    </div>

    <div style="margin-bottom: 40px;">
      <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0;">Intelligence Gathering</p>
      <div style="background: rgba(0,240,255,0.03); padding: 30px; border-radius: 20px; border-left: 4px solid #00F0FF;">
        <p style="color: #ddd; font-size: 16px; line-height: 1.8; margin: 0; font-style: italic;">"${message}"</p>
      </div>
    </div>

    <a href="${meetLink}" style="display: block; text-align: center; background: #ffffff; color: #000000; padding: 22px; border-radius: 20px; font-weight: 800; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
      Join Strategy Boardroom
    </a>
  `;
};

const generateUserThankYouHTML = (name: string) => {
  const meetLink = process.env.GOOGLE_MEET_LINK || "https://meet.google.com/aura-labs-consult";
  return generateBaseTemplate(`
    <h2 style="color: #ffffff; font-size: 42px; margin-bottom: 30px; font-weight: 800; letter-spacing: -2px; line-height: 1;">Project <br/>Acknowledged.</h2>
    <p style="font-size: 18px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 40px; font-weight: 400;">
      Greetings, ${name.split(' ')[0]}. Your transmission has been successfully decrypted and routed to our lead architecture team.
    </p>
    
    <div style="background: rgba(255,255,255,0.03); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 10px; hieght: 10px; background: #00F0FF; border-radius: 50%; box-shadow: 0 0 10px #00F0FF; margin-right: 15px;"></div>
        <p style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Status: Analyzing Vision</p>
      </div>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; line-height: 1.6;">
        Expect a direct liaison to establish contact within the next 24 business hours.
      </p>
    </div>

    <div style="text-align: center;">
      <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Urgent Inquiry?</p>
      <a href="${meetLink}" style="display: inline-block; background: transparent; color: #ffffff; padding: 18px 35px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); font-weight: 700; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
        Enter Open Boardroom
      </a>
    </div>
  `);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, message, type, plan } = req.body;
  const inquiryType = type || "Contact";
  const clientName = name || "Anonymous User";

  try {
    // 1. Prepare All Promises (Parallel Execution)
    const supabasePromise = supabase.from("contact_submissions").insert([{ 
      first_name: clientName.split(' ')[0], 
      last_name: clientName.split(' ').slice(1).join(' '), 
      email, 
      message, 
      type: inquiryType,
      plan: plan
    }]);

    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: "nishant15bihola@gmail.com",
      replyTo: email,
      subject: `⚡ NEW ${inquiryType.toUpperCase()} | ${clientName}`,
      html: generateBaseTemplate(generateContactEmailHTML(clientName, email, message, inquiryType, plan)),
    });

    const userSubject = inquiryType === "Newsletter" ? "Welcome to The Journal | Aura Labs" : "Transmission Received | Aura Labs";
    const userHTML = inquiryType === "Newsletter" ? generateBaseTemplate(`
          <h1 style="color: #ffffff; font-size: 42px; margin-bottom: 30px; font-weight: 800; letter-spacing: -2px; line-height: 1;">The Future, <br/>Delivered.</h1>
          <p style="font-size: 18px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 40px;">
            Your residency in <span style="color: #00F0FF;">The Journal</span> is confirmed. Prepare for intelligence on the bleeding edge of design and AI.
          </p>
          <div style="background: rgba(0,240,255,0.05); padding: 30px; border-radius: 20px; border: 1px dashed rgba(0,240,255,0.2); text-align: center;">
            <p style="color: #00F0FF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Access Granted • Welcome Aboard</p>
          </div>
        `) : generateUserThankYouHTML(clientName);

    const userEmailPromise = transporter.sendMail({
      from: `"Aura Labs" <${process.env.EMAIL_USER || "nishant15bihola@gmail.com"}>`,
      to: email,
      subject: userSubject,
      html: userHTML,
    });

    let notionPromise = Promise.resolve(null);
    if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID && process.env.NOTION_TOKEN !== "placeholder") {
      notionPromise = notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: clientName } }] },
          Email: { email: email },
          Message: { rich_text: [{ text: { content: message || "No message" } }] },
          Type: { select: { name: inquiryType } },
          ...(plan && { Plan: { select: { name: plan } } }),
          Date: { date: { start: new Date().toISOString() } }
        }
      });
    }

    // 2. Execute All Tasks in Parallel
    console.log(`Starting high-speed transmission for ${clientName}...`);
    const results = await Promise.allSettled([
      supabasePromise, 
      adminEmailPromise, 
      userEmailPromise, 
      notionPromise
    ]);

    // 3. Log Results for Debugging
    const [sb, resStatus, node, not] = results;
    console.log("Service Optimization Status:", {
      supabase: sb.status,
      resendAdmin: resStatus.status,
      nodemailerUser: node.status,
      notionSync: not.status
    });

    return res.status(200).json({ 
      success: true,
      performance: "Optimized Parallel Submission",
      diagnostics: {
        database: sb.status === "fulfilled",
        adminAlert: resStatus.status === "fulfilled",
        clientResponse: node.status === "fulfilled",
        notion: not.status === "fulfilled"
      }
    });
  } catch (error) {
    console.error("Critical Submission Error:", error);
    return res.status(500).json({ success: false, error: "Submission failed" });
  }
}
