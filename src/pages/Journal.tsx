import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Calendar, PenLine } from "lucide-react";
import type { JournalPost } from "../lib/sanity";

const fetchPosts = (): Promise<JournalPost[]> =>
  fetch("/api/journal").then((r) => r.json()).then((d) => d.posts || []).catch(() => []);
const fetchPost = (slug: string): Promise<JournalPost | null> =>
  fetch(`/api/journal-post?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((d) => d.post ?? null).catch(() => null);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
const readTime = (p: JournalPost) => {
  const words = (p.excerpt || "").split(/\s+/).length + (p.body?.length || 0) * 40;
  return `${Math.max(2, Math.round(words / 200))} min read`;
};

/* ── Minimal Portable Text renderer (no extra deps) ─────────────────────────── */
function renderMarks(children: any[], markDefs: any[] = []) {
  return children.map((c: any, i: number) => {
    let node: React.ReactNode = c.text;
    for (const m of (c.marks || []) as string[]) {
      const def = markDefs.find((d) => d._key === m);
      if (def?._type === "link") node = <a key={i} href={def.href} target="_blank" rel="noreferrer" className="text-[#00f0ff] underline underline-offset-2">{node}</a>;
      else if (m === "strong") node = <strong key={i} className="text-white font-semibold">{node}</strong>;
      else if (m === "em") node = <em key={i}>{node}</em>;
      else if (m === "code") node = <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-[#00f0ff] text-sm">{node}</code>;
    }
    return <span key={i}>{node}</span>;
  });
}

function PortableText({ blocks }: { blocks: any[] }) {
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  let key = 0;
  const flush = () => { if (list.length) { out.push(<ul key={key++} className="list-disc pl-6 space-y-2 my-4 text-white/70">{list}</ul>); list = []; } };
  for (const block of blocks || []) {
    if (block._type === "image" && block.url) { flush(); out.push(<img key={key++} src={block.url} alt={block.alt || ""} loading="lazy" className="rounded-2xl my-8 w-full border border-white/10" />); continue; }
    if (block._type !== "block") continue;
    const content = renderMarks(block.children || [], block.markDefs);
    if (block.listItem === "bullet") { list.push(<li key={key++}>{content}</li>); continue; }
    flush();
    switch (block.style) {
      case "h2": out.push(<h2 key={key++} className="text-2xl md:text-3xl font-serif text-white mt-12 mb-4">{content}</h2>); break;
      case "h3": out.push(<h3 key={key++} className="text-xl md:text-2xl font-serif text-white mt-8 mb-3">{content}</h3>); break;
      case "blockquote": out.push(<blockquote key={key++} className="border-l-2 border-[#00f0ff] pl-5 my-6 italic text-white/70 text-lg">{content}</blockquote>); break;
      default: out.push(<p key={key++} className="text-white/70 leading-[1.8] my-5 text-[17px]">{content}</p>);
    }
  }
  flush();
  return <div>{out}</div>;
}

/* ── Listing ────────────────────────────────────────────────────────────────── */
export function JournalList() {
  const [posts, setPosts] = useState<JournalPost[] | null>(null);
  useEffect(() => { window.scrollTo(0, 0); fetchPosts().then(setPosts); }, []);

  const featured = posts?.[0];
  const rest = posts?.slice(1) ?? [];

  return (
    <div className="relative bg-[#050505] text-white min-h-screen font-sans overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[55vh] rounded-full bg-[radial-gradient(ellipse,rgba(0,240,255,0.10),transparent_70%)] blur-2xl" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-12">
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Editorial hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="border-b border-white/10 pb-12 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
            <PenLine size={12} className="text-[#00f0ff]" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">The Journal</span>
          </div>
          <h1 className="font-display uppercase font-black tracking-tighter leading-[0.85] text-[clamp(2.75rem,11vw,7.5rem)]">
            Field notes.
          </h1>
          <p className="text-white/50 max-w-xl mt-6 text-base sm:text-lg leading-relaxed">
            Deep dives on AI, design, and shipping high-performance products — straight from the Aura Labs studio.
          </p>
        </motion.div>

        {posts === null ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] h-72 animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 border border-dashed border-white/10 rounded-3xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mx-auto mb-5"><PenLine size={22} className="text-[#00f0ff]" /></div>
            <p className="text-white/50 max-w-sm mx-auto">Fresh writing is on the way. In the meantime, <Link to="/estimate" className="text-[#00f0ff] underline underline-offset-4">price your project</Link>.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Featured */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link to={`/journal/${featured.slug}`} className="group grid md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03]">
                    {featured.image
                      ? <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,240,255,0.2),transparent_60%)]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 mb-4">
                      {featured.category && <span className="text-[#00f0ff]">{featured.category}</span>}
                      <span className="inline-flex items-center gap-1"><Calendar size={11} /> {fmtDate(featured.publishedAt)}</span>
                      <span>· {readTime(featured)}</span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-tight mb-4 group-hover:text-[#00f0ff] transition-colors">{featured.title}</h2>
                    {featured.excerpt && <p className="text-white/50 leading-relaxed mb-5 max-w-lg">{featured.excerpt}</p>}
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-bold text-white/70 group-hover:text-white">Read article <ArrowUpRight size={14} /></span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-white/10 pt-14">
                {rest.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}>
                    <Link to={`/journal/${p.slug}`} className="group block">
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] mb-4">
                        {p.image
                          ? <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          : <div className="w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(189,0,255,0.18),transparent_60%)]" />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-2">
                        {p.category && <span className="text-[#00f0ff]">{p.category}</span>}
                        <span>{fmtDate(p.publishedAt)}</span>
                      </div>
                      <h3 className="font-serif text-xl leading-snug group-hover:text-[#00f0ff] transition-colors">{p.title}</h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Detail ─────────────────────────────────────────────────────────────────── */
export function JournalPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<JournalPost | null | "missing">(null);
  useEffect(() => { window.scrollTo(0, 0); if (slug) fetchPost(slug).then((p) => setPost(p ?? "missing")); }, [slug]);

  if (post === "missing") {
    return (
      <div className="bg-[#050505] text-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif italic text-3xl mb-4">Post not found</h1>
        <Link to="/journal" className="text-[#00f0ff] underline underline-offset-4">Back to the Journal</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Link to="/journal" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} /> The Journal
        </Link>

        {post === null ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-1/3 bg-white/10 rounded-full" />
            <div className="h-12 w-full bg-white/10 rounded-2xl" />
            <div className="aspect-[16/9] bg-white/10 rounded-3xl" />
          </div>
        ) : (
          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-widest text-white/40 mb-5">
              {post.category && <span className="text-[#00f0ff]">{post.category}</span>}
              <span className="inline-flex items-center gap-1"><Calendar size={11} /> {fmtDate(post.publishedAt)}</span>
              {post.author && <span>· {post.author}</span>}
              <span>· {readTime(post)}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.02] mb-8">{post.title}</h1>
            {post.image && <img src={post.image} alt={post.title} className="rounded-3xl w-full border border-white/10 mb-10" />}
            {post.excerpt && <p className="text-xl text-white/70 leading-relaxed mb-10 font-light">{post.excerpt}</p>}
            {post.body && <PortableText blocks={post.body} />}

            <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <Link to="/journal" className="text-sm text-white/50 hover:text-white inline-flex items-center gap-2"><ArrowLeft size={14} /> All articles</Link>
              <Link to="/estimate" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#00f0ff] transition-colors">
                Start your project <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
}
