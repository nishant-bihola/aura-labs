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
  if (!data || typeof data.priceLow !== "number") return null;

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
