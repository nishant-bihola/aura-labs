/**
 * Shared project-estimate engine. Used by both the /api/estimate endpoint and
 * the chat agent's `estimate_project` tool, so a quote is identical wherever a
 * visitor asks for it.
 */
import { llmJSON } from "./llm.js";

export type ProjectEstimate = {
  summary: string;
  recommendedPlan: string;
  techStack: string[];
  phases: { name: string; description: string; weeks: number }[];
  timelineWeeks: number;
  priceLow: number;
  priceHigh: number;
  currency: string;
  notes: string;
};

const PRICING_REFERENCE = `
Aura Labs pricing (CAD), use as anchors:
- Starter (marketing site, up to 5 pages): from $1,500
- Growth (full-stack web app: auth, database, admin, AI chatbot, e-commerce): from $4,500
- AI Content (3x motion ads + 5 product images per campaign): from $800/campaign
- Brand Identity: custom
- Maintenance retainer: $150/mo
- Managed AI Chatbot SaaS: $99/mo
Complex/custom builds scale above Growth. Always give a realistic range, not a single number.
`;

export async function estimateProject(input: {
  description: string;
  services?: string[];
  budget?: string;
}): Promise<ProjectEstimate | null> {
  const system = `You are Aura Labs' senior solutions architect. From a prospect's description, produce a realistic, honest project estimate as STRICT JSON only (no prose, no markdown).

${PRICING_REFERENCE}

Return exactly this shape:
{
  "summary": "1-2 sentence read-back of what they want",
  "recommendedPlan": "Starter | Growth | AI Content | Brand Identity | Custom",
  "techStack": ["React", "Node.js", "Supabase", ...],
  "phases": [{ "name": "Discovery & UX", "description": "...", "weeks": 1 }],
  "timelineWeeks": 6,
  "priceLow": 1500,
  "priceHigh": 4500,
  "currency": "CAD",
  "notes": "assumptions, what would change the price, next step"
}
Keep 3-5 phases. Prices are integers in CAD. Be specific and grounded; never invent features they didn't ask for.`;

  const user = `Project description: ${input.description}
${input.services?.length ? `Interested in: ${input.services.join(", ")}` : ""}
${input.budget ? `Stated budget: ${input.budget}` : ""}`;

  const data = await llmJSON<ProjectEstimate>({ system, user, temperature: 0.4, maxTokens: 2048 });
  if (!data || typeof data.priceLow !== "number") {
    // AI unavailable (no key / rate-limited) — return a solid rule-based estimate
    // so the estimator ALWAYS gives the visitor a real number.
    return heuristicEstimate(input);
  }

  // Defensive normalisation so the UI never breaks on a malformed field.
  return {
    summary: data.summary || "Custom project",
    recommendedPlan: data.recommendedPlan || "Custom",
    techStack: Array.isArray(data.techStack) ? data.techStack.slice(0, 10) : [],
    phases: Array.isArray(data.phases) ? data.phases.slice(0, 6) : [],
    timelineWeeks: Number(data.timelineWeeks) || 0,
    priceLow: Math.max(0, Math.round(data.priceLow)),
    priceHigh: Math.max(Math.round(data.priceHigh || data.priceLow), Math.round(data.priceLow)),
    currency: data.currency || "CAD",
    notes: data.notes || "",
  };
}

/**
 * Deterministic estimate from keywords + selected services — the safety net when
 * the AI provider is offline. Grounded in real Aura Labs pricing.
 */
export function heuristicEstimate(input: { description: string; services?: string[]; budget?: string }): ProjectEstimate {
  const t = `${input.description} ${(input.services || []).join(" ")}`.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));

  let low = 1500, high = 4000, weeks = 3, plan = "Starter";
  const stack = new Set<string>(["React", "Tailwind CSS", "Vercel"]);
  const phases: ProjectEstimate["phases"] = [
    { name: "Discovery & UX", description: "Scope, wireframes, and visual direction.", weeks: 1 },
    { name: "Design & Build", description: "Pixel-perfect, responsive implementation.", weeks: 2 },
    { name: "Launch & Handover", description: "SEO, testing, deployment, and training.", weeks: 1 },
  ];

  if (has("web app", "webapp", "dashboard", "saas", "platform", "portal", "auth", "login", "database", "crm")) {
    low = 4500; high = 9000; weeks = 6; plan = "Growth";
    stack.add("Node.js"); stack.add("Supabase");
  }
  if (has("e-commerce", "ecommerce", "shop", "store", "checkout", "payment", "stripe", "sell")) {
    low += 2000; high += 3500; weeks += 2; plan = "Growth";
    stack.add("Stripe"); stack.add("Supabase");
  }
  if (has("chatbot", "chat bot", "ai assistant", "ai agent")) {
    low += 800; high += 1700; plan = plan === "Starter" ? "AI Content" : plan;
    stack.add("AI / LLM");
  }
  if (has("booking", "appointment", "reservation", "schedule", "calendar")) {
    low += 1000; high += 2000; weeks += 1;
  }
  if (has("ad", "ads", "video", "motion", "reel", "campaign", "content")) {
    low = 800; high = 2400; weeks = 1; plan = "AI Content";
    stack.clear(); ["Generative AI", "Motion", "After Effects"].forEach((s) => stack.add(s));
    phases.length = 0;
    phases.push(
      { name: "Concept & Script", description: "Hooks, storyboard, and shot list.", weeks: 1 },
      { name: "Production", description: "3 motion videos + 5 product images.", weeks: 1 },
    );
  }
  if (has("brand", "logo", "identity", "rebrand")) {
    if (plan === "Starter") { low = 1500; high = 4000; plan = "Brand Identity"; }
    stack.add("Figma");
  }

  return {
    summary: `A ${plan.toLowerCase()} project based on: "${input.description.slice(0, 120)}".`,
    recommendedPlan: plan,
    techStack: [...stack].slice(0, 8),
    phases,
    timelineWeeks: weeks,
    priceLow: low,
    priceHigh: high,
    currency: "CAD",
    notes: "Ballpark based on your description. Book a call or reply with more detail for a firm, itemised quote.",
  };
}

/** Plain-text rendering for the chat agent tool result. */
export function estimateToText(e: ProjectEstimate): string {
  const money = (n: number) => `$${n.toLocaleString()}`;
  const phases = e.phases.map((p) => `- ${p.name} (~${p.weeks}w): ${p.description}`).join("\n");
  return `Estimate: ${e.summary}
Recommended: ${e.recommendedPlan}
Range: ${money(e.priceLow)}–${money(e.priceHigh)} ${e.currency} · ~${e.timelineWeeks} weeks
Stack: ${e.techStack.join(", ")}
Phases:
${phases}
Notes: ${e.notes}`;
}
