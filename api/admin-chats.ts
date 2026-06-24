import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listConversations } from "./_lib/leads.js";

/**
 * Admin-only: list recent chatbot conversations. Gated by the same ADMIN_KEY as
 * the leads dashboard.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const provided = (req.headers["x-admin-key"] as string) || "";
  if (!ADMIN_KEY) return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY." });
  if (provided !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  try {
    const rows = await listConversations(100);
    const conversations = rows.map((r) => {
      let messages: { role: string; content: string }[] = [];
      try { messages = JSON.parse(r.history); } catch { messages = []; }
      const firstUser = messages.find((m) => m.role === "user")?.content || "";
      return {
        id: r.id,
        sessionId: r.sessionId,
        email: r.email,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt ?? r.createdAt,
        messageCount: messages.length,
        preview: firstUser.slice(0, 80),
        messages,
      };
    });
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Admin chats error:", error);
    return res.status(500).json({ error: "Failed to load conversations" });
  }
}
