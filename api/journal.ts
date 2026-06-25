import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPosts } from "../src/lib/sanity.js";

/** Public Journal listing — fetched server-side to avoid browser CORS on Sanity. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  try {
    const posts = await getPosts();
    return res.status(200).json({ posts });
  } catch (e) {
    console.error("journal list error:", e);
    return res.status(200).json({ posts: [] });
  }
}
