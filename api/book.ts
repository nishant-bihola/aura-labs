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

const SUPABASE_URL = process.env.SUPABASE_URL || "";
// Server-side: prefer service_role key to bypass RLS for inserts
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GOOGLE_MEET_LINK = process.env.GOOGLE_MEET_LINK || "https://meet.google.com/aura-labs-consult";

import { adminAlertHTML, clientConfirmationHTML } from './_lib/emails';

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
      html: adminAlertHTML(clientName, email, message, "Consultation Booking", plan),
    });

    const firstName = clientName.split(' ')[0] || clientName;
    const userEmailPromise = transporter.sendMail({
      from: `"Aura Labs" <${process.env.BREVO_USER || "nishant15bihola@gmail.com"}>`,
      to: email,
      subject: "We received your booking | Aura Labs",
      html: clientConfirmationHTML(clientName, plan),
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
        adminEmail: resendRes.status === "fulfilled",
        userEmail: node.status === "fulfilled"
      }
    });
  } catch (error) {
    console.error("Critical Booking Error:", error);
    return res.status(500).json({ success: false, error: "Booking failed" });
  }
}
