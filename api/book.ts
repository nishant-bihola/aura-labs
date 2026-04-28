import { Resend } from "resend";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Configure Services
const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.BREVO_USER || "nishant15bihola@gmail.com",
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const GOOGLE_MEET_LINK = process.env.GOOGLE_MEET_LINK || "https://meet.google.com/aura-labs-consult";

const generateBaseTemplate = (content: string, accentColor: string = "#00F0FF") => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
      body { margin: 0; padding: 0; background-color: #000000; }
      a { color: ${accentColor}; text-decoration: none; font-weight: 600; }
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
          <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Transmission Secure • Edmonton, AB • © 2026
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

const generateBookingEmailHTML = (firstName: string, lastName: string, email: string, date: string, time: string, timeZone: string) => `
  <h2 style="color: #ffffff; font-size: 32px; margin-bottom: 30px; font-weight: 800; letter-spacing: -1.5px; line-height: 1;">Strategy Session <br/>Locked In.</h2>
  
  <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 30px;">
    <div style="margin-bottom: 25px;">
      <p style="color: rgba(255,255,255,0.6); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: 700;">Client Architect</p>
      <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">${firstName} ${lastName}</p>
    </div>
    <div style="margin-bottom: 25px;">
      <p style="color: rgba(255,255,255,0.6); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: 700;">Scheduled Window</p>
      <p style="color: #00F0FF; font-size: 16px; margin: 0; font-weight: 600;">${date} @ ${time}</p>
      <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 5px 0 0 0;">Zone: ${timeZone}</p>
    </div>
    <div>
      <p style="color: rgba(255,255,255,0.6); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; font-weight: 700;">Connection</p>
      <p style="color: #ffffff; font-size: 16px; margin: 0;">${email}</p>
    </div>
  </div>

  <a href="${GOOGLE_MEET_LINK}" style="display: block; text-align: center; background: #ffffff; color: #000000; padding: 22px; border-radius: 20px; font-weight: 800; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
    Enter Strategy Boardroom
  </a>
`;

const generateUserBookingHTML = (firstName: string, date: string, time: string) => generateBaseTemplate(`
  <h2 style="color: #ffffff; font-size: 32px; margin-bottom: 30px; font-weight: 800; letter-spacing: -1.5px; line-height: 1;">Consultation <br/>Secured.</h2>
  <p style="font-size: 18px; line-height: 1.8; color: rgba(255,255,255,0.8); margin-bottom: 40px; font-weight: 400;">
    Greetings, ${firstName}. Your strategy session has been locked into our core calendar for <span style="color: #00F0FF; font-weight: 700;">${date} at ${time}</span>.
  </p>
  
  <div style="background: rgba(255,255,255,0.03); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px;">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <div style="width: 10px; height: 10px; background: #00F0FF; border-radius: 50%; box-shadow: 0 0 10px #00F0FF; margin-right: 15px;"></div>
      <p style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Boardroom Ready</p>
    </div>
    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 1.6; font-weight: 400;">
      Our team has been alerted. Your session is now synchronized across all architectural departments.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${GOOGLE_MEET_LINK}" style="display: block; background: #ffffff; color: #000000; padding: 22px; border-radius: 20px; font-weight: 800; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
      Enter Secure Boardroom
    </a>
  </div>

  <div style="text-align: center;">
    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+with+Aura+Labs&details=Join+Google+Meet:+${encodeURIComponent(GOOGLE_MEET_LINK)}&dates=${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00Z" style="color: rgba(255,255,255,0.4); text-decoration: underline; font-size: 12px; font-weight: 600;">Add to Google Calendar</a>
`, "#00F0FF");

const generateContactEmailHTML = (name: string, email: string, message: string, type: string, plan: string) => `
  <h2 style="color: #ffffff; font-size: 32px; margin-bottom: 30px; font-weight: 800; letter-spacing: -1.5px; line-height: 1;">New Client Inquiry</h2>
  <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05);">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Plan:</strong> ${plan}</p>
    <p><strong>Message:</strong> ${message}</p>
  </div>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, message, plan } = req.body;
  const clientName = name || "Anonymous User";

  try {
    // 1. Database Sync (Supabase)
    const supabasePromise = supabase.from("booking_submissions").insert([{ 
      name: clientName, 
      email, 
      phone: phone || null,
      message, 
      plan: plan || "Consultation"
    }]);

    // 2. Email Operations (Parallel)
    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: "nishant15bihola@gmail.com",
      replyTo: email,
      subject: `📅 NEW BOOKING | ${clientName}`,
      html: generateBaseTemplate(generateContactEmailHTML(clientName, email, message, "Consultation Booking", plan)),
    });

    const firstName = clientName.split(' ')[0] || clientName;
    const userEmailPromise = transporter.sendMail({
      from: `"Aura Labs" <${process.env.BREVO_USER || "nishant15bihola@gmail.com"}>`,
      to: email,
      subject: "We received your booking | Aura Labs",
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;"><tr><td style="height:3px;background:linear-gradient(90deg,#00f0ff,#0055ff);"></td></tr><tr><td style="padding:48px;"><p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;">Booking Confirmed</p><h1 style="margin:0 0 20px;font-size:32px;font-weight:300;color:#fff;letter-spacing:-1px;">We've got you, ${firstName}.</h1><p style="margin:0 0 32px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);">Your consultation request is confirmed. We'll reach out within 1–2 business days to lock in a time that works for you.</p><table cellpadding="0" cellspacing="0"><tr><td style="border-radius:100px;background:#fff;"><a href="https://calendar.app.google/ZQNXkk3AFDSdbyReA" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;text-decoration:none;">Book a Time Now</a></td></tr></table></td></tr><tr><td style="padding:20px 48px;border-top:1px solid rgba(255,255,255,0.06);"><p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">© 2026 Aura Labs · Edmonton, Alberta</p></td></tr></table></td></tr></table></body></html>`,
    });

    // 3. Notion Sync — skipped in book.ts (handled by /api/notion endpoint)
    const notionPromise = Promise.resolve(null);

    // Execute All in Parallel
    console.log(`Starting booking sync for ${clientName}...`);
    const results = await Promise.allSettled([
      supabasePromise, 
      adminEmailPromise, 
      userEmailPromise, 
      notionPromise
    ]);

    const [sb, resendRes, node, notionRes] = results;

    if (sb.status === "rejected") console.error("Supabase Error:", sb.reason);
    if (resendRes.status === "rejected") console.error("Resend Error:", resendRes.reason);
    if (node.status === "rejected") console.error("Nodemailer Error:", node.reason);
    if (notionRes.status === "rejected") console.error("Notion Error:", notionRes.reason);

    return res.status(200).json({ 
      success: true,
      services: {
        database: sb.status === "fulfilled",
        adminEmail: res.status === "fulfilled",
        userEmail: node.status === "fulfilled"
      }
    });
  } catch (error) {
    console.error("Critical Booking Error:", error);
    return res.status(500).json({ success: false, error: "Booking failed" });
  }
}
