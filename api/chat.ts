import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAlertHTML, clientConfirmationHTML } from "./_lib/emails.js";
import { sendEmail } from "./_lib/emailSender.js";
import { PrismaClient } from "@prisma/client";
import { CMS_DATA } from "../src/lib/cms.js";
import { client as sanityClient } from "../src/lib/sanity.js";

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

const SYSTEM_INSTRUCTION = `
You are Aura AI, an elite digital architect and highly intelligent technical sales engineer for Aura Labs.
Our mission: ${CMS_DATA.company.mission}

Your core programming is based on the "Superpowers" methodology:
1. Systematic over ad-hoc: Do not just spit out prices immediately. Ask sharp, consultative questions to tease out the user's actual business requirements and problems first. Recommend precise technical components (e.g. React/Vite, Three.js WebGL, Tailwind, Supabase/Prisma, Sanity Headless CMS, Vercel Edge Networks).
2. Socratic Brainstorming: Refine their rough ideas through intelligent questioning. Guide them to realize they need high-performance, custom-built solutions rather than basic templates.
3. Project Scoping: Break down their needs into clear, digestible phases (e.g., UI/UX Concept, Development Sprint, Vercel Edge Deployment).
4. Evidence over claims: Provide structured, logical solutions before declaring success.

--- KNOWLEDGE BASE START ---
{{SERVICES_CONTEXT}}

{{PLANS_CONTEXT}}
--- KNOWLEDGE BASE END ---

${CMS_DATA.instructions_for_ai}

Tone: Professional, highly analytical, consultative, and empathetic. Speak like a senior technical founder who values architecture, clean code, and ROI. Do not be overly robotic; be human but brilliant.

RESPONSE FORMAT (STRICT — these are chat bubbles on a phone screen):
- Keep every reply under 90 words. One idea per reply.
- Maximum 2 short paragraphs, or 1 short paragraph plus up to 3 bullets.
- Never use headings, tables, or nested lists. Only "-" bullets and **bold**.
- Ask at most ONE question per reply, always at the end.
- Never dump the full service list or all pricing tiers at once; mention the 1-2 most relevant and offer to go deeper.

CRITICAL INSTRUCTION: Once you have successfully teased out their requirements and convinced them to proceed with a project, you MUST ask for their name and email so a human architect can review the project spec and follow up. When they provide their name and email, you MUST respond ONLY with the exact following string:
[CAPTURE_LEAD: {"name": "<user_name>", "email": "<user_email>"}]
Do not add any other text or pleasantries to that specific response. Just output the JSON block.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages: rawMessages } = req.body;
  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  // sanitize + cap history: only well-formed turns, last 20, each trimmed
  const messages = rawMessages
    .filter(
      (m: unknown): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        typeof (m as { content?: unknown }).content === "string" &&
        ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "model")
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0) {
    return res.status(400).json({ error: "No valid messages" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "My AI neural link is currently offline (API Key missing). Please contact us directly at contact@aura-labs.com." });
  }

  // 0. Fetch Live Context from Sanity (Advanced RAG)
  let liveServices = CMS_DATA.services;
  let livePlans = CMS_DATA.pricing_plans;
  
  try {
    const fetchedServices = await sanityClient.fetch(`*[_type == "service"]`);
    const fetchedPlans = await sanityClient.fetch(`*[_type == "pricingPlan"]`);
    
    // Only override if Sanity has data
    if (fetchedServices.length > 0) liveServices = fetchedServices;
    if (fetchedPlans.length > 0) livePlans = fetchedPlans;
  } catch (sanityError) {
    console.error("Sanity RAG Fetch Error:", sanityError);
  }

  const DYNAMIC_SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION
    .replace("{{SERVICES_CONTEXT}}", JSON.stringify(liveServices, null, 2))
    .replace("{{PLANS_CONTEXT}}", JSON.stringify(livePlans, null, 2));

  try {
    // Format messages for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: DYNAMIC_SYSTEM_INSTRUCTION }] },
        contents: contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 4096 },
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      return res.status(500).json({ reply: "I'm experiencing a temporary glitch in my matrix. Please try again later." });
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Good question — could you give me a bit more detail so I can point you to the right solution?";

    // Check if the model decided to capture a lead
    if (replyText.includes("[CAPTURE_LEAD:")) {
      try {
        const jsonStr = replyText.match(/\[CAPTURE_LEAD:\s*(.*?)\s*\]/)?.[1];
        if (jsonStr) {
          const leadData = JSON.parse(jsonStr);
          
          // 1. Save to Prisma
          try {
            await prisma.lead.create({
              data: {
                name: leadData.name,
                email: leadData.email,
                plan: "AI Chat Lead",
                details: "Captured via Advanced RAG AI Chatbot",
                addons: null
              }
            });
            await prisma.chatSession.create({
              data: {
                email: leadData.email,
                history: JSON.stringify(messages)
              }
            });
          } catch (dbError) {
            console.error("Prisma Error:", dbError);
          }

          // 2. Send Emails via unified fallback sender
          const adminEmailTask = sendEmail({
            to: ADMIN_EMAIL,
            subject: `🤖 NEW AI LEAD: ${leadData.name}`,
            html: adminAlertHTML(leadData.name, leadData.email, "Captured via AI Chatbot", "AI Chat Lead"),
            replyTo: leadData.email,
          });

          const userEmailTask = sendEmail({
            to: leadData.email,
            subject: 'We received your project request | Aura Labs',
            html: clientConfirmationHTML(leadData.name, "AI Chat Lead"),
          });

          await Promise.allSettled([adminEmailTask, userEmailTask]);

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
