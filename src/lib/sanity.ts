import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "y0p4aq65",
  dataset: "production",
  useCdn: false, // set to false if you want fresh data always
  apiVersion: "2024-01-01",
});

// Cached read client for public content (the Journal) — fast + free via the CDN.
export const readClient = createClient({
  projectId: "y0p4aq65",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

export interface JournalPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  body?: any[];
}

const POST_FIELDS = `
  _id, title, "slug": slug.current, excerpt, category, author, publishedAt,
  "image": mainImage.asset->url
`;

export async function getPosts(): Promise<JournalPost[]> {
  try {
    return await readClient.fetch(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){${POST_FIELDS}}`
    );
  } catch (e) {
    console.error("[sanity] getPosts failed:", e);
    return [];
  }
}

export async function getPost(slug: string): Promise<JournalPost | null> {
  try {
    return await readClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
        ${POST_FIELDS},
        body[]{ ..., _type == "image" => { "url": asset->url, alt } }
      }`,
      { slug }
    );
  } catch (e) {
    console.error("[sanity] getPost failed:", e);
    return null;
  }
}
