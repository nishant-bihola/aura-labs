import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { adminPurchaseAlertHTML, paymentInstructionsHTML } from "./_lib/emails.js";
import { sendEmail } from "./_lib/emailSender.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
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

    // 1. prisma database sync
    const dbTask = (async () => {
      try {
        await prisma.lead.create({
          data: {
            name: clientName,
            email,
            plan,
            details: projectDetails || "",
            addons: addons ? addons.join(", ") : null
          }
        });
        return true;
      } catch (dbError) {
        console.error("Prisma Error in checkout:", dbError);
        return false;
      }
    })();

    // 2. Supabase Fallback Sync (traditional)
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
      dbTask,
      supabaseTask,
      adminEmailTask,
      clientEmailTask
    ]);

    const [dbRes, sbRes, adminRes, clientRes] = results;

    console.log('[Checkout] Performance Results:', {
      database: dbRes.status,
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
