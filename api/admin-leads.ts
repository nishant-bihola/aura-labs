import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbListLeads, dbListConversations } from "./_lib/db.js";

/**
 * Admin data API (ADMIN_KEY-gated). Consolidated to stay under Vercel's
 * serverless-function limit.
 *   GET /api/admin-leads                  → { leads }
 *   GET /api/admin-leads?resource=chats   → { conversations }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // ── Auth gate ──────────────────────────────────────────────────────────────
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = (req.headers["x-admin-key"] as string) || "";
  if (!ADMIN_KEY) {
    return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY in the environment." });
  }
  if (provided !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (String(req.query.resource) === "chats") {
    const { conversations, configured } = await dbListConversations();
    return res.status(200).json({ conversations, dbConfigured: configured });
  }

  const { leads, configured } = await dbListLeads();
  return res.status(200).json({ leads, dbConfigured: configured });
}
