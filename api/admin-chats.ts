import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dbListConversations } from "./_lib/db.js";

/** Admin-only: list recent chatbot conversations. Gated by ADMIN_KEY. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = (req.headers["x-admin-key"] as string) || "";
  if (!ADMIN_KEY) return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY." });
  if (provided !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  const { conversations, configured } = await dbListConversations();
  return res.status(200).json({ conversations, dbConfigured: configured });
}
