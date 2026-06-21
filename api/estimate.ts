import type { VercelRequest, VercelResponse } from "@vercel/node";
import { estimateProject } from "./_lib/estimator.js";
import { captureLead } from "./_lib/leads.js";
import { llmConfigured } from "./_lib/llm.js";

/**
 * AI Project Estimator. Returns a structured quote (range, timeline, phases,
 * stack). If the visitor includes name+email, the lead is captured too.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { description, services, budget, name, email } = req.body || {};
  if (!description || typeof description !== "string" || description.trim().length < 12) {
    return res.status(400).json({ error: "Please describe your project in a sentence or two." });
  }
  if (!llmConfigured()) {
    return res.status(503).json({ error: "The estimator is briefly offline. Please try again shortly or book a call." });
  }

  try {
    const estimate = await estimateProject({
      description: description.slice(0, 4000),
      services: Array.isArray(services) ? services : undefined,
      budget: typeof budget === "string" ? budget : undefined,
    });

    if (!estimate) {
      return res.status(200).json({ error: "Couldn't generate an estimate — try adding a bit more detail." });
    }

    // Optional lead capture when contact details are supplied (non-blocking-ish).
    let captured = false;
    if (email && typeof email === "string" && email.includes("@")) {
      const r = await captureLead({
        name: typeof name === "string" && name.trim() ? name : "Estimate Lead",
        email,
        plan: estimate.recommendedPlan,
        details: `Estimator: ${estimate.summary} (${estimate.currency} ${estimate.priceLow}-${estimate.priceHigh})`,
        source: "AI Estimator",
      }).catch(() => null);
      captured = !!r?.ok;
    }

    return res.status(200).json({ estimate, captured });
  } catch (error) {
    console.error("Estimate error:", error);
    return res.status(500).json({ error: "Estimate failed. Please try again." });
  }
}
