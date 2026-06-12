import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { adminAlertHTML, clientConfirmationHTML } from "./_lib/emails";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

const SYSTEM_INSTRUCTION = `
You are Aura AI, the lead digital architect and sales agent for Aura Labs (based in Edmonton, Alberta).
Your goal is to answer questions about our services and schedule strategy sessions by capturing the user's name and email.

Our Core Services:
1. Custom Websites & Web Apps (React, Node.js)
2. AI Chatbots (like yourself) embedded on client sites for 24/7 lead capture.
3. AI Ad Content (15-sec motion ads powered by generative AI starting at $800/campaign).
4. Complete Brand Identities (Logo, typography).

Tone: Professional, sleek, slightly futuristic but highly human and empathetic. Be extremely concise.

CRITICAL INSTRUCTION: When you have successfully convinced the user and they provide their name and email, you MUST respond ONLY with the exact following string:
[CAPTURE_LEAD: {"name": "<user_name>", "email": "<user_email>"}]
Do not add any other text to that specific response.
If they just ask a question, answer it and gently ask if they'd like to leave their email so a human architect can follow up.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "My AI neural link is currently offline (API Key missing). Please contact us directly at contact@aura-labs.com." });
  }

  try {
    // Format messages for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      return res.status(500).json({ reply: "I'm experiencing a temporary glitch in my matrix. Please try again later." });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Check if the model decided to capture a lead
    if (replyText.includes("[CAPTURE_LEAD:")) {
      try {
        const jsonStr = replyText.match(/\[CAPTURE_LEAD:\s*(.*?)\s*\]/)?.[1];
        if (jsonStr) {
          const leadData = JSON.parse(jsonStr);
          
          // 1. Save to Supabase
          if (supabase) {
            await supabase.from("contact_submissions").insert([{
              first_name: leadData.name.split(' ')[0],
              last_name: leadData.name.split(' ').slice(1).join(' '),
              email: leadData.email,
              message: "Captured via AI Chatbot",
              type: "AI Chat Lead"
            }]);
          }

          // 2. Send Emails
          if (resend) {
            await Promise.allSettled([
              resend.emails.send({
                from: "Aura Labs <onboarding@resend.dev>",
                to: ADMIN_EMAIL,
                replyTo: leadData.email,
                subject: `🤖 NEW AI LEAD: ${leadData.name}`,
                html: adminAlertHTML(leadData.name, leadData.email, "Captured via AI Chatbot", "AI Chat Lead"),
              }),
              resend.emails.send({
                from: "Aura Labs <onboarding@resend.dev>",
                to: leadData.email,
                subject: "Strategy Session | Aura Labs",
                html: clientConfirmationHTML(leadData.name, "Consultation"),
              })
            ]);
          }

          return res.status(200).json({ reply: `Perfect, ${leadData.name}. I've successfully transmitted your details to our team and sent a confirmation to ${leadData.email}. One of our lead architects will reach out shortly!` });
        }
      } catch (e) {
        console.error("Failed to parse lead capture:", e);
      }
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error("Chat handler error:", error);
    return res.status(500).json({ reply: "I'm having trouble connecting to my systems right now. Please email us directly." });
  }
}
