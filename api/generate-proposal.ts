import type { VercelRequest, VercelResponse } from "@vercel/node";
import { llmJSON, llmConfigured } from "./_lib/llm.js";

/**
 * Admin-only: turn a lead's details into a ready-to-send proposal + follow-up
 * email draft. Gated by the same ADMIN_KEY as the leads dashboard.
 */
type ProposalOutput = {
  proposal: string; // markdown
  emailSubject: string;
  emailBody: string;
  estimateRange: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = (req.headers["x-admin-key"] as string) || "";
  if (!ADMIN_KEY) return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY." });
  if (provided !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  if (!llmConfigured()) return res.status(503).json({ error: "AI is briefly offline. Try again shortly." });

  const { name, email, plan, details } = req.body || {};
  if (!name && !email) return res.status(400).json({ error: "Lead name or email required." });

  const system = `You are a senior solutions architect at Aura Labs (web dev, web apps, AI chatbots, AI ad content; projects from $1,500 CAD, based in Edmonton).
Write a concise, persuasive client proposal and a short follow-up email from the lead's details.
Return STRICT JSON only:
{
  "proposal": "markdown proposal: Overview, Recommended Solution, Scope & Phases, Investment range (CAD), Timeline, Next Steps",
  "emailSubject": "short subject line",
  "emailBody": "warm 4-6 sentence follow-up email signed 'Nishant, Aura Labs'",
  "estimateRange": "e.g. $4,500 - $7,000 CAD"
}
Be specific to their request; never invent unrelated features. Keep the proposal under ~280 words.`;

  const user = `Lead name: ${name || "Unknown"}
Email: ${email || "n/a"}
Plan/interest: ${plan || "n/a"}
Project details: ${details || "n/a"}`;

  try {
    const out = await llmJSON<ProposalOutput>({ system, user, temperature: 0.6, maxTokens: 2600 });
    if (!out || !out.proposal) {
      return res.status(200).json({ error: "Could not generate a proposal. Try again." });
    }
    return res.status(200).json({
      proposal: out.proposal,
      emailSubject: out.emailSubject || `Your Aura Labs proposal`,
      emailBody: out.emailBody || "",
      estimateRange: out.estimateRange || "",
    });
  } catch (error) {
    console.error("Proposal error:", error);
    return res.status(500).json({ error: "Generation failed. Please try again." });
  }
}
