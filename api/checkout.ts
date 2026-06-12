import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { adminPurchaseAlertHTML, paymentInstructionsHTML } from "./_lib/emails.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { name, email, plan, projectDetails, addons } = await req.json();

    try {
      await prisma.lead.create({
        data: {
          name,
          email,
          plan,
          details: projectDetails,
          addons: addons ? addons.join(", ") : null
        }
      });
    } catch (dbError) {
      console.error("Prisma Error:", dbError);
    }

    if (resend) {
      await Promise.allSettled([
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
          replyTo: email,
          subject: `💰 CHECKOUT INTENT: ${name} for ${plan}`,
          html: adminPurchaseAlertHTML(name, email, plan, projectDetails),
        }),
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
          to: email,
          subject: "Payment Instructions | Aura Labs",
          html: paymentInstructionsHTML(name, plan),
        })
      ]);
    } else {
      console.warn("Resend not configured, skipping checkout emails");
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Checkout API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
