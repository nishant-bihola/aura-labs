import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Calendar } from "lucide-react";
import { getPosts, getPost, type JournalPost } from "../lib/sanity";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

/* ── Minimal Portable Text renderer (no extra deps) ─────────────────────────── */
function renderMarks(children: any[], markDefs: any[] = []) {
  return children.map((c: any, i: number) => {
    let node: React.ReactNode = c.text;
    const marks: string[] = c.marks || [];
    for (const m of marks) {
      const def = markDefs.find((d) => d._key === m);
      if (def?._type === "link") {
        node = <a key={i} href={def.href} target="_blank" rel="noreferrer" className="text-[#00f0ff] underline underline-offset-2">{node}</a>;
      } else if (m === "strong") node = <strong key={i} className="text-white font-semibold">{node}</strong>;
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
  const flush = () => {
    if (list.length) { out.push(<ul key={key++} className="list-disc pl-6 space-y-2 my-4 text-white/70">{list}</ul>); list = []; }
  };

  for (const block of blocks || []) {
    if (block._type === "image" && block.url) {
      flush();
      out.push(<img key={key++} src={block.url} alt={block.alt || ""} loading="lazy" className="rounded-2xl my-8 w-full border border-white/10" />);
      continue;
    }
    if (block._type !== "block") continue;
    const content = renderMarks(block.children || [], block.markDefs);
    if (block.listItem === "bullet") { list.push(<li key={key++}>{content}</li>); continue; }
    flush();
    switch (block.style) {
      case "h2": out.push(<h2 key={key++} className="text-2xl md:text-3xl font-serif text-white mt-12 mb-4">{content}</h2>); break;
      case "h3": out.push(<h3 key={key++} className="text-xl md:text-2xl font-serif text-white mt-8 mb-3">{content}</h3>); break;
      case "blockquote": out.push(<blockquote key={key++} className="border-l-2 border-[#00f0ff] pl-5 my-6 italic text-white/70">{content}</blockquote>); break;
      default: out.push(<p key={key++} className="text-white/70 leading-relaxed my-4">{content}</p>);
    }
  }
  flush();
  return <div>{out}</div>;
}

/* ── Listing ────────────────────────────────────────────────────────────────── */
export function JournalList() {
  const [posts, setPosts] = useState<JournalPost[] | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getPosts().then(setPosts);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">The Journal</span>
        <h1 className="font-valtero-serif italic text-4xl md:text-6xl tracking-tight leading-[0.95] mt-3 mb-4">
          Notes on AI, design & shipping fast.
        </h1>
        <p className="text-white/50 max-w-xl mb-16 leading-relaxed">
          Field notes from the Aura Labs studio — how we build high-performance, AI-driven products.
        </p>

        {posts === null ? (
          <div className="py-16 text-white/40 animate-pulse">Loading the journal…</div>
        ) : posts.length === 0 ? (
          <div className="py-16 border border-dashed border-white/10 rounded-3xl text-center text-white/40">
            No posts yet — fresh writing is on the way.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.06, 0.4) }}>
                <Link to={`/journal/${p.slug}`} className="group block bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all">
                  {p.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 mb-3">
                      {p.category && <span className="text-[#00f0ff]">{p.category}</span>}
                      <span className="inline-flex items-center gap-1"><Calendar size={11} /> {fmtDate(p.publishedAt)}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif text-white mb-2 group-hover:text-[#00f0ff] transition-colors">{p.title}</h2>
                    {p.excerpt && <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{p.excerpt}</p>}
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold text-white/60 mt-4 group-hover:text-white">
                      Read <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    getPost(slug).then((p) => setPost(p ?? "missing"));
  }, [slug]);

  if (post === "missing") {
    return (
      <div className="bg-[#050505] text-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-valtero-serif italic text-3xl mb-4">Post not found</h1>
        <Link to="/journal" className="text-[#00f0ff] underline underline-offset-4">Back to the Journal</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-32">
        <Link to="/journal" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} /> The Journal
        </Link>

        {post === null ? (
          <div className="py-16 text-white/40 animate-pulse">Loading…</div>
        ) : (
          <article>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 mb-4">
              {post.category && <span className="text-[#00f0ff]">{post.category}</span>}
              <span className="inline-flex items-center gap-1"><Calendar size={11} /> {fmtDate(post.publishedAt)}</span>
              {post.author && <span>· {post.author}</span>}
            </div>
            <h1 className="font-valtero-serif italic text-3xl md:text-5xl tracking-tight leading-[1.05] mb-8">{post.title}</h1>
            {post.image && <img src={post.image} alt={post.title} className="rounded-3xl w-full border border-white/10 mb-10" />}
            {post.excerpt && <p className="text-lg text-white/70 leading-relaxed mb-8">{post.excerpt}</p>}
            {post.body && <PortableText blocks={post.body} />}

            <div className="mt-16 pt-8 border-t border-white/10">
              <Link to="/estimate" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#00f0ff] transition-colors">
                Start your project <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
