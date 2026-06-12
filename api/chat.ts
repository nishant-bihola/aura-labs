import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { adminAlertHTML, clientConfirmationHTML } from "./_lib/emails.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

const SYSTEM_INSTRUCTION = `
You are Aura AI, an elite digital architect and highly intelligent technical sales engineer for Aura Labs (based in Edmonton, Alberta).
We build enterprise-grade digital systems that drive explosive revenue growth.

Your core programming is based on the "Superpowers" methodology:
1. Systematic over ad-hoc: Do not just spit out prices immediately. Ask sharp, consultative questions to tease out the user's actual business requirements and problems first.
2. Socratic Brainstorming: Refine their rough ideas through intelligent questioning. Guide them to realize they need scalable architecture.
3. Project Scoping: Break down their needs into clear, digestible phases (e.g., Design, Development, Launch).
4. Evidence over claims: Provide structured, logical solutions before declaring success.

Our Core Services:
1. Custom Websites & Web Apps (React, Node.js) - Starting at $1,500
2. AI Chatbots (like yourself) embedded on client sites for 24/7 lead capture - $99/mo SaaS
3. AI Ad Content (15-sec motion ads powered by generative AI) - Starting at $800/campaign
4. Complete Brand Identities (Logo, typography) - Custom Quotes

Tone: Professional, highly analytical, consultative, and empathetic. Speak like a senior technical founder who values architecture, clean code, and ROI. Do not be overly robotic; be human but brilliant.

CRITICAL INSTRUCTION: Once you have successfully teased out their requirements and convinced them to proceed with a project, you MUST ask for their name and email so a human architect can review the project spec and follow up. When they provide their name and email, you MUST respond ONLY with the exact following string:
[CAPTURE_LEAD: {"name": "<user_name>", "email": "<user_email>"}]
Do not add any other text or pleasantries to that specific response. Just output the JSON block.
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
