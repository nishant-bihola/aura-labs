import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Lightweight in-memory rate limiter (per serverless instance). Not distributed
 * — a cold start or a second instance resets the window — but it cheaply blunts
 * bursts/abuse from a single client without any extra infra, protecting the
 * free Groq quota. For strict global limits, swap the Map for Upstash Redis.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Occasionally evict expired buckets so the Map can't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

export function clientIp(req: VercelRequest): string {
  const fwd = (req.headers["x-forwarded-for"] as string) || "";
  return fwd.split(",")[0].trim() || (req.socket?.remoteAddress ?? "unknown");
}

/**
 * Returns true if the request is allowed. When it returns false it has already
 * written a 429 JSON response (with Retry-After), so the caller should stop.
 */
export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  opts: { limit: number; windowMs: number; key?: string }
): boolean {
  const now = Date.now();
  sweep(now);
  const id = `${opts.key || "default"}:${clientIp(req)}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  if (bucket.count >= opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      error: "Too many requests. Please slow down a moment.",
      retryAfter,
    });
    return false;
  }

  bucket.count += 1;
  return true;
}
