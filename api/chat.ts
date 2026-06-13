import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAlertHTML, clientConfirmationHTML } from "./_lib/emails.js";
import { sendEmail } from "./_lib/emailSender.js";
import { PrismaClient } from "@prisma/client";
import { CMS_DATA } from "../src/lib/cms.js";
import { client as sanityClient } from "../src/lib/sanity.js";
import { Client as NotionClient } from '@notionhq/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || '';

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
    // Cap the RAG fetch so a slow/misconfigured CMS can never stall the chat.
    const withTimeout = <T,>(p: Promise<T>, ms: number) =>
      Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Sanity timeout")), ms)),
      ]);

    const [fetchedServices, fetchedPlans] = await Promise.all([
      withTimeout(sanityClient.fetch(`*[_type == "service"]`), 2500),
      withTimeout(sanityClient.fetch(`*[_type == "pricingPlan"]`), 2500),
    ]);

    // Only override if Sanity has data
    if (Array.isArray(fetchedServices) && fetchedServices.length > 0) liveServices = fetchedServices;
    if (Array.isArray(fetchedPlans) && fetchedPlans.length > 0) livePlans = fetchedPlans;
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

    const replyText = await generateReply(contents, DYNAMIC_SYSTEM_INSTRUCTION, GEMINI_API_KEY);

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

          // 1b. Notion CRM Sync (Parallel)
          const notionTask = (async () => {
            if (!NOTION_TOKEN || !NOTION_DB_ID) return false;
            try {
              const notion = new NotionClient({ auth: NOTION_TOKEN });
              await notion.pages.create({
                parent: { database_id: NOTION_DB_ID },
                properties: {
                  Name: { title: [{ text: { content: leadData.name || 'AI Chat Lead' } }] },
                  Email: { email: leadData.email },
                  Message: { rich_text: [{ text: { content: "Lead qualified and captured via Aura AI Chatbot conversation." } }] },
                  Source: { select: { name: 'AI Agent' } },
                  Type: { select: { name: 'AI Chatbot' } },
                  Date: { date: { start: new Date().toISOString() } },
                  Status: { status: { name: 'Not started' } },
                },
              });
              return true;
            } catch (notionError) {
              console.error("Notion Error in chat lead capture:", notionError);
              return false;
            }
          })();

          // 1c. Supabase Sync (Parallel)
          const supabaseTask = (async () => {
            if (!SUPABASE_URL || !SUPABASE_KEY) return false;
            try {
              const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
              const nameParts = (leadData.name || 'AI Lead').split(' ');
              await supabase.from("contact_submissions").insert([{ 
                first_name: nameParts[0] || "AI Lead", 
                last_name: nameParts.slice(1).join(' ') || "", 
                email: leadData.email, 
                message: "Lead qualified and captured via Aura AI Chatbot conversation.", 
                type: "AI Agent Lead",
                plan: "AI Chat Lead"
              }]);
              return true;
            } catch (sbError) {
              console.error("Supabase Error in chat lead capture:", sbError);
              return false;
            }
          })();

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

          await Promise.allSettled([
            adminEmailTask, 
            userEmailTask,
            notionTask,
            supabaseTask
          ]);

          return res.status(200).json({ reply: `Perfect, ${leadData.name}. I've successfully transmitted your details to our team and sent a confirmation to ${leadData.email}. One of our lead architects will reach out shortly!` });
        }
      } catch (e) {
        console.error("Failed to parse lead capture:", e);
      }
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error("Chat handler error:", error);
    // Never surface a raw failure to the visitor. Give a useful, on-brand reply
    // that keeps the sales conversation alive and routes them to a human.
    return res.status(200).json({ reply: GRACEFUL_FALLBACK });
  }
}

const GRACEFUL_FALLBACK =
  "I'm getting a lot of requests right now, so let me keep this simple. " +
  "Aura Labs builds high-performance websites, web apps, AI chatbots, and AI ad content — projects start at $1,500. " +
  "Tell me what you're building and I'll point you to the right fit, or email **contact@aura-labs.com** and a human architect will jump in.";

/**
 * Calls Gemini with built-in resilience so the visitor never sees a raw error:
 *  - thinking disabled (faster + cheaper + no token-budget contradiction)
 *  - per-request timeout via AbortController
 *  - exponential-backoff retries on transient 429/5xx
 *  - a secondary model as a final fallback
 * Throws only if every attempt fails (handler then serves GRACEFUL_FALLBACK).
 */
async function generateReply(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  apiKey: string
): Promise<string> {
  const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const MAX_ATTEMPTS = 2; // per model

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 800,
      // Disable "thinking": a concise sales bot doesn't need it, and on 2.5
      // thinking tokens eat the output budget — the root cause of empty/cut
      // replies and the "matrix glitch" the business kept seeing.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let lastErr: unknown = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text: string =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          if (text) return text;
          // Empty body (safety block / truncation) — try again, then fall back.
          lastErr = new Error("Empty Gemini response");
        } else {
          const errText = await response.text().catch(() => "");
          lastErr = new Error(`Gemini ${response.status}: ${errText.slice(0, 200)}`);
          // 4xx other than 429 won't fix on retry — break to next model.
          if (response.status !== 429 && response.status < 500) break;
        }
      } catch (e) {
        clearTimeout(timeout);
        lastErr = e;
      }

      // backoff before the next attempt (250ms, 500ms …)
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }

  console.error("Gemini exhausted all retries:", lastErr);
  // Soft fallback rather than throwing — keeps the conversation flowing.
  return GRACEFUL_FALLBACK;
}
