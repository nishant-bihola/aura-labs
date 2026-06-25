import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPost } from "../src/lib/sanity.js";

/** Single Journal post by ?slug= — fetched server-side (no browser CORS). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug || "");
  if (!slug) return res.status(400).json({ error: "slug required" });
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  try {
    const post = await getPost(slug);
    return res.status(200).json({ post });
  } catch (e) {
    console.error("journal post error:", e);
    return res.status(200).json({ post: null });
  }
}
