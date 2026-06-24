import type { VercelRequest, VercelResponse } from "@vercel/node";
import { streamChatAgent, GRACEFUL_FALLBACK } from "./_lib/chatAgent.js";
import { llmConfigured } from "./_lib/llm.js";
import { rateLimit } from "./_lib/rateLimit.js";
import { saveConversation } from "./_lib/leads.js";

/**
 * Streaming chat endpoint (Server-Sent Events). Emits {token} events as the
 * model generates, a final {done} event, then persists the conversation so the
 * admin can review it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!rateLimit(req, res, { limit: 20, windowMs: 60000, key: "chat" })) return;

  const { messages, sessionId } = req.body || {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: "Messages array required" });

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  (res as unknown as { flushHeaders?: () => void }).flushHeaders?.();

  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  if (!llmConfigured()) {
    send({ token: "My AI is briefly offline. Please email **nishant15bihola@gmail.com** or book a call." });
    send({ done: true });
    return res.end();
  }

  let full = "";
  try {
    full = await streamChatAgent(messages, (token) => send({ token }));
  } catch (e) {
    console.error("chat-stream error:", e);
    send({ token: GRACEFUL_FALLBACK });
    full = GRACEFUL_FALLBACK;
  }

  send({ done: true });
  res.end();

  // Persist the conversation (fire-and-forget; never blocks the response).
  if (typeof sessionId === "string" && sessionId) {
    const transcript = [...messages, { role: "model", content: full }];
    void saveConversation(sessionId, transcript);
  }
}
