import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminPurchaseAlertHTML, paymentInstructionsHTML } from "./_lib/emails.js";
import { sendEmail } from "./_lib/emailSender.js";
import { getSupabase } from "./_lib/db.js";

const supabase = getSupabase();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, plan, projectDetails, addons } = req.body;
    const clientName = name || "Anonymous";

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1. Supabase — persist the checkout intent as a lead.
    const supabaseTask = (async () => {
      if (!supabase) return false;
      try {
        const nameParts = clientName.split(' ');
        await supabase.from("contact_submissions").insert([{ 
          first_name: nameParts[0] || clientName, 
          last_name: nameParts.slice(1).join(' ') || "", 
          email, 
          message: projectDetails || "", 
          type: "Checkout Intent",
          plan: plan
        }]);
        return true;
      } catch (sbError) {
        console.error("Supabase Error in checkout:", sbError);
        return false;
      }
    })();

    // 3. Admin Purchase Alert
    const adminEmailTask = sendEmail({
      to: ADMIN_EMAIL,
      subject: `💰 CHECKOUT INTENT: ${clientName} for ${plan}`,
      html: adminPurchaseAlertHTML(clientName, email, plan, projectDetails),
      replyTo: email,
    });

    // 4. Client Confirmation Payment Instructions
    const clientEmailTask = sendEmail({
      to: email,
      subject: "Payment Instructions | Aura Labs",
      html: paymentInstructionsHTML(clientName, plan),
    });

    // Run parallel tasks
    const results = await Promise.allSettled([
      supabaseTask,
      adminEmailTask,
      clientEmailTask
    ]);

    const [sbRes, adminRes, clientRes] = results;

    console.log('[Checkout] Performance Results:', {
      supabase: sbRes.status,
      adminEmail: adminRes.status,
      clientEmail: clientRes.status
    });

    return res.status(200).json({ 
      success: true,
      delivered: clientRes.status === 'fulfilled' && (clientRes as PromiseFulfilledResult<any>).value?.success
    });
  } catch (error) {
    console.error("Checkout API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
