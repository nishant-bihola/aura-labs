import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbListLeads } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // ── Auth gate ──────────────────────────────────────────────────────────────
  // Returns customer PII, so require the x-admin-key header to match ADMIN_KEY.
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = (req.headers["x-admin-key"] as string) || "";
  if (!ADMIN_KEY) {
    return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY in the environment." });
  }
  if (provided !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { leads, configured } = await dbListLeads();
  return res.status(200).json({ leads, dbConfigured: configured });
}
