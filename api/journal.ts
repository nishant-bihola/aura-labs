import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPosts, getPost } from "../src/lib/sanity.js";

/**
 * Public Journal API — fetched server-side to avoid browser CORS on Sanity.
 * GET /api/journal            → { posts }
 * GET /api/journal?slug=xyz   → { post }
 * (Consolidated with the single-post handler to stay under Vercel's function limit.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  const slug = req.query.slug ? String(req.query.slug) : "";

  try {
    if (slug) {
      const post = await getPost(slug);
      return res.status(200).json({ post });
    }
    const posts = await getPosts();
    return res.status(200).json({ posts });
  } catch (e) {
    console.error("journal error:", e);
    return res.status(200).json(slug ? { post: null } : { posts: [] });
  }
}
