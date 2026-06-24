/**
 * Provider-agnostic LLM layer for Aura Labs agents.
 *
 * One OpenAI-compatible client drives three interchangeable backends — chosen
 * by env so the SAME code is free in every environment:
 *   • Groq   — fast, free tier, great tool-calling   (production)
 *   • Ollama — local Hermes 3, 100% free & private    (local dev)
 *   • Gemini — Google's OpenAI-compatible endpoint     (fallback)
 *
 * Selection precedence:
 *   LLM_PROVIDER (explicit) → GROQ_API_KEY → GEMINI_API_KEY → ollama(localhost)
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type Provider = "groq" | "ollama" | "gemini";

type ProviderConfig = { baseURL: string; apiKey: string; model: string };

function resolveProvider(): Provider {
  const explicit = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (explicit === "groq" || explicit === "ollama" || explicit === "gemini") {
    return explicit;
  }
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "ollama";
}

function providerConfig(provider: Provider): ProviderConfig {
  switch (provider) {
    case "groq":
      return {
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY || "",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      };
    case "gemini":
      return {
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: process.env.GEMINI_API_KEY || "",
        // 2.0-flash is NOT a thinking model — its full token budget goes to the
        // answer, so JSON output never truncates. (2.5-flash spends most of the
        // budget reasoning over the OpenAI-compat layer and cuts JSON short.)
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      };
    case "ollama":
    default:
      return {
        baseURL: `${process.env.OLLAMA_HOST || "http://localhost:11434"}/v1`,
        apiKey: "ollama", // Ollama ignores the key but the client requires one.
        model: process.env.OLLAMA_MODEL || "hermes3",
      };
  }
}

export function activeProvider(): Provider {
  return resolveProvider();
}

export function llmConfigured(): boolean {
  const p = resolveProvider();
  if (p === "ollama") return true; // assume a local daemon is reachable
  return !!providerConfig(p).apiKey;
}

export type LlmResult = {
  content: string;
  toolCalls: ToolCall[];
  finishReason?: string;
};

type LlmOptions = {
  messages: ChatMessage[];
  tools?: ToolDef[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
  retries?: number;
};

/** Single chat completion with timeout + exponential-backoff retries. */
export async function llmChat(opts: LlmOptions): Promise<LlmResult> {
  const provider = resolveProvider();
  const cfg = providerConfig(provider);
  const retries = opts.retries ?? 2;
  // Local Ollama (often a large model on modest hardware) is far slower than a
  // hosted API, so give it a generous ceiling; hosted providers stay snappy.
  const timeoutMs = opts.timeoutMs ?? (provider === "ollama" ? 120000 : 25000);

  const body: Record<string, unknown> = {
    model: cfg.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 800,
  };
  if (opts.tools?.length) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        lastErr = new Error(`${provider} ${res.status}: ${errText.slice(0, 240)}`);
        // 4xx (except rate limit) won't recover on retry.
        if (res.status !== 429 && res.status < 500) break;
      } else {
        const data = await res.json();
        const choice = data.choices?.[0];
        const msg = choice?.message ?? {};
        return {
          content: (msg.content || "").trim(),
          toolCalls: (msg.tool_calls as ToolCall[]) || [],
          finishReason: choice?.finish_reason,
        };
      }
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  console.error("[llm] all attempts failed:", lastErr);
  throw lastErr instanceof Error ? lastErr : new Error("LLM request failed");
}

export type ToolExecutor = (args: Record<string, any>) => Promise<string> | string;

/** One streaming completion. Forwards content tokens via onToken; returns the
 * full content plus any tool calls assembled from streamed deltas. */
async function streamOnce(
  cfg: ProviderConfig,
  opts: { messages: ChatMessage[]; tools?: ToolDef[]; temperature?: number; maxTokens?: number; onToken: (t: string) => void }
): Promise<{ content: string; toolCalls: ToolCall[] }> {
  const body: Record<string, unknown> = {
    model: cfg.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 800,
    stream: true,
  };
  if (opts.tools?.length) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${cfg.baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`stream ${res.status}: ${errText.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const toolMap = new Map<number, { id: string; name: string; args: string }>();

  // Suppress <think>…</think> reasoning (some local models stream it).
  let inThink = false;
  const emit = (chunk: string) => {
    let text = chunk;
    while (text) {
      if (inThink) {
        const end = text.indexOf("</think>");
        if (end === -1) return;
        text = text.slice(end + 8);
        inThink = false;
      }
      const start = text.indexOf("<think>");
      if (start === -1) { content += text; opts.onToken(text); return; }
      const before = text.slice(0, start);
      if (before) { content += before; opts.onToken(before); }
      text = text.slice(start + 7);
      inThink = true;
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") continue;
      let json: any;
      try { json = JSON.parse(data); } catch { continue; }
      const delta = json.choices?.[0]?.delta;
      if (!delta) continue;
      if (typeof delta.content === "string" && delta.content) emit(delta.content);
      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          const cur = toolMap.get(idx) || { id: "", name: "", args: "" };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name = tc.function.name;
          if (tc.function?.arguments) cur.args += tc.function.arguments;
          toolMap.set(idx, cur);
        }
      }
    }
  }

  const toolCalls: ToolCall[] = [...toolMap.values()]
    .filter((t) => t.name)
    .map((t) => ({
      id: t.id || `call_${Math.random().toString(36).slice(2)}`,
      type: "function",
      function: { name: t.name, arguments: t.args },
    }));

  return { content, toolCalls };
}

/**
 * Streaming agentic loop. Streams content tokens to onToken while still
 * supporting tool-calls (tool turns run between streamed passes). Returns the
 * full assistant text.
 */
export async function streamAgent(args: {
  messages: ChatMessage[];
  tools: ToolDef[];
  executors: Record<string, ToolExecutor>;
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
  onToken: (t: string) => void;
}): Promise<string> {
  const cfg = providerConfig(resolveProvider());
  const messages = [...args.messages];
  const maxSteps = args.maxSteps ?? 4;
  let full = "";

  for (let step = 0; step < maxSteps; step++) {
    const { content, toolCalls } = await streamOnce(cfg, {
      messages,
      tools: args.tools,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      onToken: (t) => { full += t; args.onToken(t); },
    });

    if (!toolCalls.length) return full;

    messages.push({ role: "assistant", content: content || "", tool_calls: toolCalls });
    for (const call of toolCalls) {
      let parsed: Record<string, any> = {};
      try { parsed = call.function.arguments ? JSON.parse(call.function.arguments) : {}; } catch { parsed = {}; }
      const exec = args.executors[call.function.name];
      let output: string;
      try { output = exec ? await exec(parsed) : `Unknown tool: ${call.function.name}`; }
      catch (e) { output = `Tool ${call.function.name} failed: ${e instanceof Error ? e.message : "error"}`; }
      messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: output });
    }
  }
  return full;
}

/**
 * Agentic loop: lets the model call tools, runs them, feeds results back, and
 * repeats until it produces a final text answer (or hits maxSteps).
 * `onToolResult` lets callers capture structured side effects (e.g. a captured
 * lead) for the API response.
 */
export async function runAgent(args: {
  messages: ChatMessage[];
  tools: ToolDef[];
  executors: Record<string, ToolExecutor>;
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
  onToolResult?: (name: string, args: Record<string, any>, result: string) => void;
}): Promise<string> {
  const messages = [...args.messages];
  const maxSteps = args.maxSteps ?? 4;

  for (let step = 0; step < maxSteps; step++) {
    const result = await llmChat({
      messages,
      tools: args.tools,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
    });

    if (!result.toolCalls.length) {
      return result.content;
    }

    // Record the assistant turn that requested the tools.
    messages.push({ role: "assistant", content: result.content || "", tool_calls: result.toolCalls });

    for (const call of result.toolCalls) {
      let parsed: Record<string, any> = {};
      try {
        parsed = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        parsed = {};
      }
      const exec = args.executors[call.function.name];
      let output: string;
      try {
        output = exec ? await exec(parsed) : `Unknown tool: ${call.function.name}`;
      } catch (e) {
        output = `Tool ${call.function.name} failed: ${e instanceof Error ? e.message : "error"}`;
      }
      args.onToolResult?.(call.function.name, parsed, output);
      messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: output });
    }
  }

  // One final pass without tools to force a written answer.
  const final = await llmChat({ messages, temperature: args.temperature, maxTokens: args.maxTokens });
  return final.content;
}

/** Structured-output helper: returns parsed JSON of type T (or null on failure). */
export async function llmJSON<T>(args: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<T | null> {
  try {
    const res = await llmChat({
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      temperature: args.temperature ?? 0.4,
      // Generous ceiling: thinking models (e.g. Gemini 2.5) spend part of the
      // budget reasoning, so a low cap truncates the JSON mid-string.
      maxTokens: args.maxTokens ?? 2048,
      jsonMode: true,
    });
    // Be forgiving: strip reasoning/<think> blocks and code fences that local
    // models (e.g. qwen3) emit, then pull out the JSON object.
    let text = res.content
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/```(?:json)?/gi, "")
      .trim();
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text) as T;
  } catch (e) {
    console.error("[llmJSON] parse/fetch failed:", e);
    return null;
  }
}
