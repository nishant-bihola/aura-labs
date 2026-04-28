import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const convert12hTo24h = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString().padStart(2, '0');
  return `${hours.padStart(2, '0')}${minutes}00`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, date, time } = req.body;

  try {
    // 1. Store in Supabase
    const { error: supabaseError } = await supabase
      .from("bookings")
      .insert([{ name, email, date, time }]);

    if (supabaseError) {
      console.error("Supabase Booking Error:", supabaseError);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    // 2. Prepare Emails
    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
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
          <p style="margin-top: 40px; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px;">Stored in Supabase CRM • Aura Labs System</p>
        </div>
      `,
    });

    const userEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: email,
      subject: "Consultation Confirmed | Aura Labs",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a; text-align: center;">
          <div style="margin-bottom: 40px;">
            <span style="background: linear-gradient(90deg, #00FF94, #00CC7E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
          </div>
          <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Consultation Secured.</h1>
          <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 30px;">
            Hi ${name.split(' ')[0]}, your architectural consultation has been successfully added to our grid.
          </p>
          <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 40px; text-align: left; display: inline-block; width: 100%; box-sizing: border-box;">
            <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</strong><br/><span style="font-size: 18px;">${date}</span></div>
            <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</strong><br/><span style="font-size: 18px;">${time} (Edmonton Time)</span></div>
            <div><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Protocol</strong><br/><span style="font-size: 18px;">Virtual Interface / Google Meet</span></div>
          </div>
          <p style="font-size: 14px; color: #404040; margin-bottom: 40px;">
            A direct calendar invitation with the access link will be transmitted shortly.
          </p>
          <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">
            © 2026 Aura Labs • Core Operations
          </div>
        </div>
      `
    });

    // 3. Fire both emails in parallel
    await Promise.allSettled([adminEmailPromise, userEmailPromise]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ success: false, error: "Booking failed" });
  }
}
