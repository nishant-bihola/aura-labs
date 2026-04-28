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

    // 2. Send Admin Notification
    await resend.emails.send({
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

    // 3. Send User Confirmation
    try {
      await resend.emails.send({
        from: "Aura Labs <onboarding@resend.dev>",
        to: email,
        subject: "Consultation Confirmed | Aura Labs",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333; text-align: center;">
            <h1 style="color: #00FF94; font-size: 28px; margin-bottom: 20px; font-style: italic;">Consultation Secured</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #ddd; margin-bottom: 20px;">
              Hi ${name.split(' ')[0]}, your architectural consultation has been successfully scheduled.
            </p>
            <div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${time} (Edmonton Time)</p>
              <p style="margin: 5px 0;"><strong>Method:</strong> Virtual / Google Meet</p>
            </div>
            <p style="font-size: 14px; color: #888; margin-bottom: 30px;">
              A calendar invitation with the meeting link will be sent to this email shortly.
            </p>
            <div style="padding: 20px; border-top: 1px solid #333; color: #444; font-size: 12px;">
              © 2026 Aura Labs • Edmonton, Alberta
            </div>
          </div>
        `
      });
    } catch (err) {
      console.error("User booking confirmation failed:", err);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ success: false, error: "Booking failed" });
  }
}
