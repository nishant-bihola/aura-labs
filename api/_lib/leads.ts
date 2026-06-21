/**
 * Shared lead capture + AI qualification.
 * Used by the chat agent's capture_lead tool and the proposal/qualify endpoints
 * so persistence and scoring live in one place.
 */
import { PrismaClient } from "@prisma/client";
import { Client as NotionClient } from "@notionhq/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { adminAlertHTML, clientConfirmationHTML } from "./emails.js";
import { sendEmail } from "./emailSender.js";
import { llmJSON } from "./llm.js";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || "";
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || "";

export type LeadQualification = {
  score: number; // 0-100
  priority: "High" | "Medium" | "Low";
  summary: string;
  suggestedReply: string;
};

/** AI-score a lead so the team can triage at a glance. Never throws. */
export async function qualifyLead(input: {
  name: string;
  email: string;
  plan?: string;
  details?: string;
}): Promise<LeadQualification | null> {
  const system = `You are an SDR for Aura Labs (web dev, web apps, AI chatbots, AI ad content; projects from $1,500 CAD).
Score an inbound lead and reply with STRICT JSON only:
{ "score": 0-100, "priority": "High|Medium|Low", "summary": "one line", "suggestedReply": "a warm, specific 2-3 sentence reply the founder can send" }
Score higher for clear scope, real budget signals, business email, and urgency.`;
  const user = `Name: ${input.name}
Email: ${input.email}
Plan/interest: ${input.plan || "n/a"}
Details: ${input.details || "n/a"}`;

  const q = await llmJSON<LeadQualification>({ system, user, temperature: 0.3, maxTokens: 400 });
  if (!q || typeof q.score !== "number") return null;
  return {
    score: Math.max(0, Math.min(100, Math.round(q.score))),
    priority: q.priority === "High" || q.priority === "Low" ? q.priority : "Medium",
    summary: q.summary || "",
    suggestedReply: q.suggestedReply || "",
  };
}

/**
 * Persist a lead everywhere (Prisma, Notion, Supabase) and send both emails.
 * `qualify` runs the AI scorer and folds the result into the admin alert.
 * Returns a short status string suitable for an agent tool result.
 */
export async function captureLead(input: {
  name: string;
  email: string;
  plan?: string;
  details?: string;
  source?: string;
}): Promise<{ ok: boolean; message: string; qualification: LeadQualification | null }> {
  const name = input.name?.trim() || "AI Chat Lead";
  const email = input.email?.trim() || "";
  const plan = input.plan || "AI Chat Lead";
  const details = input.details || "Captured via Aura AI agent";

  if (!email || !email.includes("@")) {
    return { ok: false, message: "A valid email is required to capture the lead.", qualification: null };
  }

  // Qualify first so the admin alert can carry the score.
  const qualification = await qualifyLead({ name, email, plan, details }).catch(() => null);
  const scoreLine = qualification
    ? `\n\nAI score: ${qualification.score}/100 (${qualification.priority}). ${qualification.summary}`
    : "";

  const dbTask = (async () => {
    try {
      await prisma.lead.create({ data: { name, email, plan, details, addons: null } });
      return true;
    } catch (e) {
      console.error("[leads] Prisma error:", e);
      return false;
    }
  })();

  const notionTask = (async () => {
    if (!NOTION_TOKEN || !NOTION_DB_ID) return false;
    try {
      const notion = new NotionClient({ auth: NOTION_TOKEN });
      await notion.pages.create({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Email: { email },
          Message: { rich_text: [{ text: { content: details + scoreLine } }] },
          Source: { select: { name: input.source || "AI Agent" } },
          Type: { select: { name: "AI Chatbot" } },
          Date: { date: { start: new Date().toISOString() } },
          Status: { status: { name: "Not started" } },
        },
      });
      return true;
    } catch (e) {
      console.error("[leads] Notion error:", e);
      return false;
    }
  })();

  const supabaseTask = (async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;
    try {
      const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
      const parts = name.split(" ");
      await supabase.from("contact_submissions").insert([
        {
          first_name: parts[0] || "AI Lead",
          last_name: parts.slice(1).join(" ") || "",
          email,
          message: details + scoreLine,
          type: input.source || "AI Agent Lead",
          plan,
        },
      ]);
      return true;
    } catch (e) {
      console.error("[leads] Supabase error:", e);
      return false;
    }
  })();

  const adminEmailTask = sendEmail({
    to: ADMIN_EMAIL,
    subject: `🤖 NEW AI LEAD${qualification ? ` [${qualification.priority} · ${qualification.score}]` : ""}: ${name}`,
    html: adminAlertHTML(name, email, details + scoreLine, "AI Chat Lead", plan),
    replyTo: email,
  });

  const userEmailTask = sendEmail({
    to: email,
    subject: "We received your project request | Aura Labs",
    html: clientConfirmationHTML(name, plan),
  });

  await Promise.allSettled([dbTask, notionTask, supabaseTask, adminEmailTask, userEmailTask]);

  return {
    ok: true,
    message: `Lead captured for ${name} (${email}). A confirmation email is on its way and the team has been alerted.`,
    qualification,
  };
}
