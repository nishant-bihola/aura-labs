import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { adminPurchaseAlertHTML, paymentInstructionsHTML } from "./_lib/emails.js";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { name, email, plan, projectDetails } = await req.json();

    if (supabase) {
      await supabase.from("contact_submissions").insert([{ 
        first_name: name.split(' ')[0], 
        last_name: name.split(' ').slice(1).join(' '), 
        email, 
        message: projectDetails, 
        type: "Checkout Intent",
        plan: plan
      }]);
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
