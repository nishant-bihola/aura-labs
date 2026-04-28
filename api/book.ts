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

const generateBaseTemplate = (content: string, accentColor: string = "#00FF66") => `
  <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a;">
    <div style="margin-bottom: 40px; text-align: center;">
      <span style="background: linear-gradient(90deg, ${accentColor}, #00CC44); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
    </div>
    ${content}
    <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center; margin-top: 40px;">
      © 2026 Aura Labs • Edmonton, Alberta • System Transmission
    </div>
  </div>
`;

const generateBookingEmailHTML = (firstName: string, lastName: string, email: string, date: string, time: string, timeZone: string) => `
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New Consultation Booked</h2>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
    <p style="margin: 10px 0;"><strong>Client:</strong> ${firstName} ${lastName}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
    <p style="margin: 10px 0;"><strong>Scheduled:</strong> <span style="color: #00FF66;">${date} at ${time}</span></p>
    <p style="margin: 10px 0;"><strong>Zone:</strong> ${timeZone}</p>
  </div>
  <div style="text-align: center; margin-top: 30px;">
    <a href="${GOOGLE_MEET_LINK}" style="background: #00FF66; color: #000; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">Join Boardroom</a>
  </div>
`;

const generateUserBookingHTML = (firstName: string, date: string, time: string) => generateBaseTemplate(`
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Consultation Secured.</h2>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 20px;">
    Hello ${firstName}, your strategy session has been locked in for <span style="color: #00FF66;">${date} at ${time}</span>.
  </p>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
    Our lead architects are preparing for the deep dive. Use the link below to join the secure boardroom at the scheduled time.
  </p>
  
  <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: #0a0a0a; border-radius: 20px; border: 1px solid #1a1a1a;">
    <p style="margin: 0 0 20px 0; font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 2px;">Secure Meeting Link</p>
    <a href="${GOOGLE_MEET_LINK}" style="background: #ffffff; color: #000; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 2px; font-size: 11px;">Join Google Meet</a>
  </div>

  <div style="text-align: center;">
    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation+with+Aura+Labs&details=Join+Google+Meet:+${encodeURIComponent(GOOGLE_MEET_LINK)}&dates=${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00Z" style="color: #666; text-decoration: underline; font-size: 12px;">Add to Google Calendar</a>
  </div>
`, "#00FF66");

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
