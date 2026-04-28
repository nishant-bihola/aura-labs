import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { Client as NotionClient } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN 
});

const generateBaseTemplate = (content: string, accentColor: string = "#00F0FF") => `
  <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a;">
    <div style="margin-bottom: 40px; text-align: center;">
      <span style="background: linear-gradient(90deg, ${accentColor}, #0077FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
    </div>
    ${content}
    <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center; margin-top: 40px;">
      © 2026 Aura Labs • Edmonton, Alberta • System Transmission
    </div>
  </div>
`;

const generateContactEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => `
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New ${type} Submission</h2>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
    <p style="margin: 10px 0;"><strong>Client:</strong> ${name}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
    ${plan ? `<p style="margin: 10px 0;"><strong>Interested Plan:</strong> <span style="color: #00F0FF;">${plan}</span></p>` : ""}
  </div>
  <div style="padding: 20px; border-left: 2px solid #00F0FF; background: #050505;">
    <p style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Message Content</p>
    <p style="font-size: 16px; line-height: 1.6; color: #ddd; margin: 0;">${message}</p>
  </div>
`;

const generateUserThankYouHTML = (name: string) => generateBaseTemplate(`
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Transmission Received.</h2>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 20px;">
    Greetings, ${name.split(' ')[0]}. We've successfully captured your project details.
  </p>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
    Our team is currently reviewing your vision. Expect a detailed response from one of our lead architects within <span style="color: #00F0FF;">24-48 hours</span>.
  </p>
  <div style="padding: 20px; border-radius: 15px; background: #ffffff10; border: 1px solid #ffffff10;">
    <p style="margin: 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Status</p>
    <p style="margin: 5px 0 0; font-weight: 600; color: #00F0FF;">Awaiting Architect Review</p>
  </div>
`);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, message, type, plan } = req.body;
  const inquiryType = type || "Contact";

  try {
    // 1. Store in Supabase
    const { error: supabaseError } = await supabase.from("contact_submissions").insert([{ 
      first_name: name.split(' ')[0], 
      last_name: name.split(' ').slice(1).join(' '), 
      email, 
      message, 
      type: inquiryType,
      plan: plan
    }]);

    if (supabaseError) console.error("Supabase Error:", supabaseError);

    // 2. Send Emails via Resend
    const adminEmailPromise = resend.emails.send({
      from: "Aura Labs <onboarding@resend.dev>",
      to: "nishant15bihola@gmail.com",
      replyTo: email,
      subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
      html: generateBaseTemplate(generateContactEmailHTML(name, email, message, inquiryType, plan)),
    });

    let userEmailPromise = Promise.resolve(null);
    if (inquiryType === "Newsletter") {
      userEmailPromise = resend.emails.send({
        from: "Aura Labs <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to The Journal | Aura Labs",
        html: generateBaseTemplate(`
          <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Welcome to the Inner Circle</h1>
          <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
            Your subscription to <span style="color: #00F0FF;">The Journal</span> is confirmed. You'll receive our deep dives into the future of digital residency.
          </p>
        `)
      });
    } else {
      userEmailPromise = resend.emails.send({
        from: "Aura Labs <onboarding@resend.dev>",
        to: email,
        subject: "Transmission Received | Aura Labs",
        html: generateUserThankYouHTML(name)
      });
    }

    // 3. Notion Sync
    let notionPromise = Promise.resolve(null);
    if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID && process.env.NOTION_TOKEN !== "placeholder") {
      notionPromise = notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Email: { email: email },
          Message: { rich_text: [{ text: { content: message } }] },
          Type: { select: { name: inquiryType } },
          ...(plan && { Plan: { select: { name: plan } } }),
          Date: { date: { start: new Date().toISOString() } }
        }
      });
    }

    // 4. Parallel Execution
    await Promise.allSettled([adminEmailPromise, userEmailPromise, notionPromise]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Submission Error:", error);
    return res.status(500).json({ success: false, error: "Submission failed" });
  }
}
