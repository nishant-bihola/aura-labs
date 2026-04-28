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

    // 2. Prepare Emails
    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
      reply_to: email,
      subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
      html: generateEmailHTML(name, email, message, inquiryType, plan),
    });

    let userEmailPromise = Promise.resolve(null);

    if (inquiryType === "Newsletter") {
      userEmailPromise = resend.emails.send({
        from: "Aura Labs <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to The Journal | Aura Labs",
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a; text-align: center;">
            <div style="margin-bottom: 40px;">
              <span style="background: linear-gradient(90deg, #00F0FF, #0077FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Welcome to the Inner Circle</h1>
            <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
              Your subscription to <span style="color: #00F0FF;">The Journal</span> is confirmed. You'll be the first to receive our deep dives into design, architecture, and the future of digital residency.
            </p>
            <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">
              © 2026 Aura Labs • System Transmission
            </div>
          </div>
        `
      });
    } else {
      userEmailPromise = resend.emails.send({
        from: "Aura Labs <onboarding@resend.dev>",
        to: email,
        subject: "Transmission Received | Aura Labs",
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a;">
            <div style="margin-bottom: 40px; text-align: center;">
              <span style="background: linear-gradient(90deg, #00F0FF, #0077FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
            </div>
            <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Architectural Inquiry Received.</h2>
            <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 20px;">
              Greetings, ${name.split(' ')[0]}. We've successfully captured your transmission.
            </p>
            <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
              Our team is currently analyzing the technical requirements of your project. Expect a detailed response from one of our lead architects within <span style="color: #00F0FF;">24-48 hours</span>.
            </p>
            <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center;">
              © 2026 Aura Labs • Edmonton, Alberta
            </div>
          </div>
        `
      });
    }

    // 3. Fire both emails in parallel for "Instant" delivery
    await Promise.allSettled([adminEmailPromise, userEmailPromise]);

    return res.status(200).json({ success: true });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Submission Error:", error);
    return res.status(500).json({ success: false, error: "Submission failed" });
  }
}
