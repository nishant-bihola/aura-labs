import { Resend } from "resend";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
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
      Our lead architects are preparing for the deep dive. Join the secure boardroom link below at the scheduled time.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${GOOGLE_MEET_LINK}" style="display: block; background: #ffffff; color: #000000; padding: 22px; border-radius: 20px; font-weight: 800; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">
      Enter Secure Boardroom
    </a>
  </div>

  <div style="text-align: center;">
    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+with+Aura+Labs&details=Join+Google+Meet:+${encodeURIComponent(GOOGLE_MEET_LINK)}&dates=${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00Z" style="color: rgba(255,255,255,0.4); text-decoration: underline; font-size: 12px; font-weight: 600;">Add to Google Calendar</a>
  </div>
`, "#00F0FF");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { firstName, lastName, email, date, time, timeZone } = req.body;

  try {
    // 1. Prepare All Promises (Parallel Execution)
    const supabasePromise = supabase.from("bookings").insert([{ 
      first_name: firstName, 
      last_name: lastName, 
      email, 
      booking_date: date, 
      booking_time: time, 
      time_zone: timeZone 
    }]);

    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: "nishant15bihola@gmail.com",
      replyTo: email,
      subject: `NEW CONSULTATION: ${firstName} ${lastName}`,
      html: generateBaseTemplate(generateBookingEmailHTML(firstName, lastName, email, date, time, timeZone), "#00FF66"),
    });

    const userEmailPromise = transporter.sendMail({
      from: `"Aura Labs" <${process.env.EMAIL_USER || "nishant15bihola@gmail.com"}>`,
      to: email,
      subject: "Consultation Secured | Aura Labs",
      html: generateUserBookingHTML(firstName, date, time)
    });

    // 2. Execute All Tasks in Parallel
    console.log(`Starting booking transmission for ${firstName} (${email})...`);
    const results = await Promise.allSettled([
      supabasePromise, 
      adminEmailPromise, 
      userEmailPromise
    ]);

    // 3. Log Results for Debugging
    const [sb, res, node] = results;
    console.log("Booking Service Status:", {
      supabase: sb.status,
      resendAdmin: res.status,
      nodemailerUser: node.status
    });

    if (sb.status === "rejected") console.error("Supabase Error:", sb.reason);
    if (res.status === "rejected") console.error("Resend Error:", res.reason);
    if (node.status === "rejected") console.error("Nodemailer Error:", node.reason);

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
