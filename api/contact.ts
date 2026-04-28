import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const generateEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
    <h2 style="color: #00F0FF; font-size: 24px; margin-bottom: 20px;">New ${type} received</h2>
    <div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
      ${plan ? `<p style="margin: 10px 0;"><strong>Interested Plan:</strong> ${plan}</p>` : ""}
    </div>
    <div style="border-top: 1px solid #333; padding-top: 20px;">
      <p style="color: #888; font-size: 14px; margin-bottom: 10px;">Message:</p>
      <p style="font-size: 16px; line-height: 1.6; color: #ddd;">${message}</p>
    </div>
    <div style="margin-top: 40px; text-align: center; color: #444; font-size: 12px;">
      © 2026 Aura Labs • Premium Digital Solutions
    </div>
  </div>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message, type, plan } = req.body;
  const inquiryType = type || "Contact";

  try {
    // 1. Store in Supabase
    const { error: supabaseError } = await supabase
      .from("contact_submissions")
      .insert([{ 
        first_name: name.split(' ')[0], 
        last_name: name.split(' ').slice(1).join(' '), 
        email, 
        message, 
        type: inquiryType,
        plan: plan
      }]);

    if (supabaseError) {
      console.error("Supabase Error:", supabaseError);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    // 2. Send Admin Notification
    // We use the onboarding@resend.dev address if no domain is verified
    await resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
      reply_to: email,
      subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
      html: generateEmailHTML(name, email, message, inquiryType, plan),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Submission Error:", error);
    return res.status(500).json({ success: false, error: "Submission failed" });
  }
}
