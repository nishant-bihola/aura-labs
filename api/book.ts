import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAlertHTML, clientConfirmationHTML } from './_lib/emails.js';
import { sendEmail } from "./_lib/emailSender.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, message, plan } = req.body;
  const clientName = name || "Anonymous User";

  try {
    // 1. Database Sync (Supabase)
    const supabasePromise = (async () => {
      if (!supabase) return false;
      try {
        const { error } = await supabase.from("booking_submissions").insert([{ 
          name: clientName, 
          email, 
          phone: phone || null,
          message: message || "", 
          plan: plan || "Consultation"
        }]);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase Error in booking:", err);
        return false;
      }
    })();

    // 2. Admin Booking Notification Email
    const adminEmailPromise = sendEmail({
      to: ADMIN_EMAIL,
      subject: `📅 NEW BOOKING | ${clientName}`,
      html: adminAlertHTML(clientName, email, message, "Consultation Booking", plan),
      replyTo: email,
    });

    // 3. User Confirmation Email
    const userEmailPromise = sendEmail({
      to: email,
      subject: "We received your booking | Aura Labs",
      html: clientConfirmationHTML(clientName, plan),
    });

    // Execute All in Parallel
    console.log(`Starting booking sync for ${clientName}...`);
    const results = await Promise.allSettled([
      supabasePromise, 
      adminEmailPromise, 
      userEmailPromise
    ]);

    const [sb, adminRes, userRes] = results;

    const sbSuccess = sb.status === "fulfilled" && sb.value;
    const adminSuccess = adminRes.status === "fulfilled" && (adminRes as PromiseFulfilledResult<any>).value?.success;
    const userSuccess = userRes.status === "fulfilled" && (userRes as PromiseFulfilledResult<any>).value?.success;

    return res.status(200).json({ 
      success: true,
      services: {
        database: sbSuccess,
        adminEmail: adminSuccess,
        userEmail: userSuccess
      }
    });
  } catch (error) {
    console.error("Critical Booking Error:", error);
    return res.status(500).json({ success: false, error: "Booking failed" });
  }
}
