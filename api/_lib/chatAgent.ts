/**
 * Aura AI chat agent. A consultative, tool-using sales engineer shared by the
 * Vercel function (api/chat.ts) and the dev server (server.ts).
 */
import { CMS_DATA } from "../../src/lib/cms.js";
import { BOOKING_URL } from "./emails.js";
import { runAgent, type ChatMessage, type ToolDef } from "./llm.js";
import { estimateProject, estimateToText } from "./estimator.js";
import { captureLead } from "./leads.js";

export const GRACEFUL_FALLBACK =
  "I'm getting a lot of requests right now, so let me keep this simple. " +
  "Aura Labs builds high-performance websites, web apps, AI chatbots, and AI ad content — projects start at $1,500. " +
  "Tell me what you're building and I'll point you to the right fit, or email **contact@aura-labs.com** and a human architect will jump in.";

const TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "estimate_project",
      description:
        "Generate a realistic price range, timeline, recommended plan, tech stack and phases for a described project. Call this when the user describes what they want to build or asks 'how much'.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "What the user wants to build, in their words." },
          services: { type: "array", items: { type: "string" }, description: "Relevant services e.g. Web Development, AI Chatbots, AI Ad Content." },
          budget: { type: "string", description: "Any stated budget, optional." },
        },
        required: ["description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Save the prospect's contact details so a human can follow up. Call this ONLY after the user has shared both their name and email and shown real interest.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          summary: { type: "string", description: "One line on what they want." },
        },
        required: ["name", "email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "Return the link to book a strategy call. Use when the user wants to talk to a human or schedule a meeting.",
      parameters: { type: "object", properties: {} },
    },
  },
];

function systemPrompt(): string {
  return `You are Aura AI, an elite digital architect and technical sales engineer for Aura Labs.
Mission: ${CMS_DATA.company.mission}
Based in ${CMS_DATA.company.location}, serving clients worldwide.

KNOWLEDGE BASE (quote prices ONLY from here or the estimate_project tool):
Services: ${JSON.stringify(CMS_DATA.services)}
Plans: ${JSON.stringify(CMS_DATA.pricing_plans)}

HOW YOU WORK:
- Be consultative: ask one sharp question to understand their goal before pitching.
- When they describe a project or ask cost, call estimate_project and present the range conversationally.
- When they're interested, ask for their name + email, then call capture_lead.
- If they want to talk to a human, call get_booking_link.

RESPONSE FORMAT (chat bubbles on a phone):
- Under 90 words. One idea per reply. Max 2 short paragraphs or 1 paragraph + up to 3 "-" bullets.
- No headings or tables. Ask at most ONE question, at the end.
- Never dump the whole service list or every price at once.`;
}

const executors = {
  estimate_project: async (args: Record<string, any>) => {
    const est = await estimateProject({
      description: String(args.description || ""),
      services: Array.isArray(args.services) ? args.services : undefined,
      budget: args.budget ? String(args.budget) : undefined,
    });
    return est ? estimateToText(est) : "Could not generate an estimate; ask the user for a bit more detail about the project.";
  },
  capture_lead: async (args: Record<string, any>) => {
    const res = await captureLead({
      name: String(args.name || ""),
      email: String(args.email || ""),
      details: String(args.summary || "Captured via Aura AI agent"),
      plan: "AI Chat Lead",
      source: "AI Agent",
    });
    return res.message;
  },
  get_booking_link: async () => `Booking link: ${BOOKING_URL} (or the /contact page).`,
};

export type IncomingMessage = { role: "user" | "model" | "assistant"; content: string };

/** Sanitize + cap inbound history, then run the agent. Never throws to the caller. */
export async function runChatAgent(rawMessages: unknown): Promise<string> {
  const list = Array.isArray(rawMessages) ? rawMessages : [];
  const history: ChatMessage[] = list
    .filter(
      (m): m is IncomingMessage =>
        !!m && typeof m === "object" && typeof (m as any).content === "string" &&
        ["user", "model", "assistant"].includes((m as any).role)
    )
    .slice(-20)
    .map((m) => ({
      role: m.role === "model" ? "assistant" : (m.role as "user" | "assistant"),
      content: m.content.slice(0, 4000),
    }));

  if (!history.length) return "Hi! I'm Aura AI. What are you looking to build?";

  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt() }, ...history];

  try {
    const reply = await runAgent({
      messages,
      tools: TOOLS,
      executors,
      temperature: 0.6,
      maxTokens: 700,
      maxSteps: 4,
    });
    return reply?.trim() || GRACEFUL_FALLBACK;
  } catch (e) {
    console.error("[chatAgent] failed:", e);
    return GRACEFUL_FALLBACK;
  }
}
