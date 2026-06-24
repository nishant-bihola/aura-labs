import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runChatAgent, GRACEFUL_FALLBACK } from "./_lib/chatAgent.js";
import { llmConfigured } from "./_lib/llm.js";
import { rateLimit } from "./_lib/rateLimit.js";

/**
 * Aura AI chat endpoint. Thin wrapper around the shared, tool-using agent
 * (api/_lib/chatAgent.ts). The agent itself handles estimates, lead capture
 * and booking via function-calling, and degrades gracefully on any failure.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!rateLimit(req, res, { limit: 20, windowMs: 60000, key: "chat" })) return;

  const { messages } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  if (!llmConfigured()) {
    return res.status(200).json({
      reply:
        "My AI is briefly offline. Please email **nishant15bihola@gmail.com** or book a call and a human will jump in.",
    });
  }

  try {
    const reply = await runChatAgent(messages);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat handler error:", error);
    return res.status(200).json({ reply: GRACEFUL_FALLBACK });
  }
}
