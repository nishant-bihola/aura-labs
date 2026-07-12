/**
 * Aura AI chat agent. A consultative, tool-using sales engineer shared by the
 * Vercel function (api/chat.ts) and the dev server (server.ts).
 */
import { CMS_DATA } from "../../src/lib/cms.js";
import { PROJECTS } from "../../src/data/projects.js";
import { BOOKING_URL } from "./emails.js";
import { runAgent, streamAgent, type ChatMessage, type ToolDef } from "./llm.js";
import { estimateProject, estimateToText } from "./estimator.js";
import { captureLead } from "./leads.js";

export const GRACEFUL_FALLBACK =
  "Aura Labs builds high-performance websites, web apps, AI chatbots, and AI ad content — projects start at $1,500. " +
  "Tell me what you're building (or ask about pricing, timelines, or a service) and I'll point you the right way — or email **nishant15bihola@gmail.com**.";

/**
 * Rule-based assistant used when the live AI provider is unavailable (no key /
 * rate-limited). It still answers the most common visitor questions from real
 * Aura Labs info, so the chatbot is never a dead end. The moment a working
 * GROQ_API_KEY (or other provider) is set, full AI conversation takes over.
 */
export function smartFallback(userText: string): string {
  const t = (userText || "").toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));

  if (has("price", "cost", "how much", "budget", "pricing", "expensive", "charge", "rate", "quote", "$", "afford"))
    return "Here's a quick guide (CAD):\n- **Marketing website** — from $1,500\n- **Full web app** (auth, database, dashboard, AI) — from $4,500\n- **AI chatbot** — from $800 one-time, or $99/mo managed\n- **AI ad content** — from $800/campaign\n\nFor a tailored number, use our instant estimator at **/estimate**, or tell me what you're building.";

  if (has("chatbot", "chat bot", "ai bot", "assistant", "automate support", "support bot"))
    return "We build custom AI chatbots that handle support, bookings and lead capture 24/7 — from **$800** one-time, or **$99/mo** fully managed. What would you want yours to do?";

  if (has("website", "web site", "web app", "webapp", "landing", "e-commerce", "ecommerce", "online store", "shop", "site"))
    return "We build high-performance sites and web apps in React — marketing sites from **$1,500**, full apps (auth, database, dashboards, payments) from **$4,500**. What's the project?";

  if (has("ad", "ads", "video", "motion", "reel", "tiktok", "instagram", "campaign", "creative"))
    return "Our AI Ad Content service delivers **3 motion ad videos + 5 product images** per campaign from **$800**, in 24–48 hours. What are you promoting?";

  if (has("brand", "logo", "identity", "design system"))
    return "We craft full brand identities — logo, typography, and brand guidelines that build trust from day one. Want to see examples or get a quote?";

  if (has("how long", "timeline", "time", "weeks", "deadline", "how fast", "when can", "turnaround"))
    return "Rough timelines: a marketing site is ~1–2 weeks, a full web app ~4–8 weeks, and ad content 24–48 hours. What are you building?";

  if (has("what do you", "services", "offer", "what can you", "do you make", "do you build", "help with", "what is aura"))
    return "Aura Labs builds:\n- **Websites & web apps** (React/Node, e-commerce, dashboards)\n- **AI chatbots** for support, bookings & leads\n- **AI ad content** (motion videos + product imagery)\n- **Brand identity**\n\nWhat are you looking to build?";

  if (has("contact", "call", "book", "meeting", "talk to", "human", "email", "reach", "phone", "hire", "get started", "work with", "let's talk"))
    return `Let's talk. Book a strategy call from the **Contact** page (${BOOKING_URL}) or email **nishant15bihola@gmail.com**. Want an instant estimate first? Try **/estimate**.`;

  if (has("work", "portfolio", "example", "case study", "past", "clients", "proof"))
    return `Recent work includes ${PROJECTS.slice(0, 3).map((p) => `**${p.title}** (${p.category})`).join(", ")}. Want details on any of them, or a quote for something similar?`;

  if (/^(hi|hey|hello|yo|sup|howdy|good (morning|afternoon|evening))\b/.test(t) || has("who are you"))
    return "Hey! I'm Aura AI. I can help you scope a website, web app, AI chatbot, or ad campaign — and give you a ballpark price. What are you building?";

  return GRACEFUL_FALLBACK;
}

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
  {
    type: "function",
    function: {
      name: "get_portfolio",
      description:
        "Return real Aura Labs case studies to reference as proof. Use when the user asks about past work, examples, or wants to see what you've built. Optionally filter by keyword (e.g. 'e-commerce', 'restaurant').",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Optional topic/industry/tech to filter by." },
        },
      },
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
- When they ask for examples or proof, call get_portfolio and reference a real project by name.
- When they're interested, ask for their name + email, then call capture_lead.
- If they want to talk to a human, call get_booking_link.
- Be warm and concrete. Lead toward a next step (estimate, examples, or a call) in every reply.

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
  get_portfolio: async (args: Record<string, any>) => {
    const kw = String(args.keyword || "").toLowerCase().trim();
    let list = PROJECTS;
    if (kw) {
      const match = PROJECTS.filter((p) =>
        [p.title, p.category, p.description, p.client, ...(p.services || [])]
          .join(" ").toLowerCase().includes(kw)
      );
      if (match.length) list = match;
    }
    const top = list.slice(0, 4).map((p) =>
      `- ${p.title} (${p.category}): ${p.description}${p.liveUrl ? ` [live: ${p.liveUrl}]` : ""}`
    );
    return `Relevant Aura Labs work:\n${top.join("\n")}`;
  },
};

export type IncomingMessage = { role: "user" | "model" | "assistant"; content: string };

/** Sanitize + cap inbound history into provider-ready messages with the system prompt. */
function buildMessages(rawMessages: unknown): ChatMessage[] | null {
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

  if (!history.length) return null;
  return [{ role: "system", content: systemPrompt() }, ...history];
}

/** The most recent user message (used to tailor the rule-based fallback). */
function lastUserText(rawMessages: unknown): string {
  const list = Array.isArray(rawMessages) ? rawMessages : [];
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i];
    if (m && typeof m === "object" && (m as any).role === "user" && typeof (m as any).content === "string") {
      return (m as any).content;
    }
  }
  return "";
}

/** Non-streaming agent run. Never throws to the caller. */
export async function runChatAgent(rawMessages: unknown): Promise<string> {
  const messages = buildMessages(rawMessages);
  if (!messages) return "Hi! I'm Aura AI. What are you looking to build?";
  const fallback = smartFallback(lastUserText(rawMessages));
  try {
    const reply = await runAgent({ messages, tools: TOOLS, executors, temperature: 0.6, maxTokens: 700, maxSteps: 4 });
    return reply?.trim() || fallback;
  } catch (e) {
    console.error("[chatAgent] failed:", e);
    return fallback;
  }
}

/**
 * Streaming agent run. Streams tokens via onToken and resolves with the full
 * reply (for persistence). If the AI provider is unavailable, it streams a
 * tailored rule-based answer so the bot still helps the visitor.
 */
export async function streamChatAgent(rawMessages: unknown, onToken: (t: string) => void): Promise<string> {
  const messages = buildMessages(rawMessages);
  if (!messages) {
    const hi = "Hi! I'm Aura AI. What are you looking to build?";
    onToken(hi);
    return hi;
  }
  const fallback = smartFallback(lastUserText(rawMessages));
  try {
    const reply = await streamAgent({ messages, tools: TOOLS, executors, temperature: 0.6, maxTokens: 700, maxSteps: 4, onToken });
    if (reply && reply.trim()) return reply;
    onToken(fallback);
    return fallback;
  } catch (e) {
    console.error("[chatAgent stream] failed:", e);
    onToken(fallback);
    return fallback;
  }
}
