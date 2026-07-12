import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock, Layers, Check, ArrowRight, Wand2 } from "lucide-react";

type Estimate = {
  summary: string;
  recommendedPlan: string;
  techStack: string[];
  phases: { name: string; description: string; weeks: number }[];
  timelineWeeks: number;
  priceLow: number;
  priceHigh: number;
  currency: string;
  notes: string;
};

const SERVICES = ["Web Development", "Web App", "AI Chatbot", "AI Ad Content", "Brand Identity", "E-commerce"];

const SAMPLES = [
  "A booking website for my salon with online payments and an AI chatbot that answers FAQs.",
  "A full e-commerce store with customer accounts, inventory, and Stripe checkout.",
  "3 motion ad videos + product images for my new skincare launch on Instagram.",
  "A SaaS dashboard with user auth, a database, and an admin panel.",
];

/** Smooth count-up for the headline price. */
function useCountUp(target: number, run: boolean, ms = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return val;
}

export default function Estimator() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [emailed, setEmailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resultRef = useRef<HTMLDivElement>(null);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const money = (n: number) => `$${n.toLocaleString()}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 12) {
      setErrorMsg("Tell me a bit more about your project (one or two sentences).");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    setEstimate(null);
    // On mobile, bring the result area into view.
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, services: selected, budget, name, email }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.estimate) {
        setErrorMsg(data.error || "Couldn't generate an estimate. Please try again.");
        setStatus("error");
        return;
      }
      setEstimate(data.estimate);
      setEmailed(!!data.emailed);
      setStatus("done");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="relative bg-[#050505] text-white min-h-screen font-sans overflow-hidden selection:bg-[#00f0ff] selection:text-black">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full bg-[radial-gradient(ellipse,rgba(0,240,255,0.12),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute top-[30%] -right-40 w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(circle,rgba(189,0,255,0.10),transparent_70%)] blur-2xl" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-12">
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
            <Sparkles size={13} className="text-[#00f0ff]" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">AI Project Estimator</span>
          </div>
          <h1 className="font-display uppercase font-black tracking-tighter leading-[0.85] text-[clamp(2.75rem,10vw,7rem)]">
            Price your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-white to-[#bd00ff]">idea in seconds.</span>
          </h1>
          <p className="text-white/50 max-w-xl mt-6 text-base sm:text-lg leading-relaxed">
            Describe what you want to build. Our AI architect returns a realistic price range, timeline,
            recommended plan, and a phase-by-phase breakdown — instantly.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-start">
          {/* ── Form ─────────────────────────────────────────────── */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8 space-y-7"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-3">Describe your project</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="e.g. A booking website for my salon with online payments, customer login, and an AI chatbot…"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/60 focus:ring-2 focus:ring-[#00f0ff]/20 transition-all resize-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-widest text-white/30 self-center mr-1 inline-flex items-center gap-1"><Wand2 size={11} /> Try:</span>
                {SAMPLES.map((s, i) => (
                  <button type="button" key={i} onClick={() => setDescription(s)}
                    className="text-[11px] text-white/50 border border-white/10 rounded-full px-3 py-1.5 hover:border-[#00f0ff]/50 hover:text-white transition-colors max-w-[220px] truncate">
                    {s.split(" ").slice(0, 4).join(" ")}…
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-3">What do you need? (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => {
                  const on = selected.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => toggle(s)}
                      className={`text-xs px-4 py-2 rounded-full border transition-all ${on ? "bg-[#00f0ff]/15 border-[#00f0ff]/60 text-[#00f0ff]" : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"}`}>
                      {on && <Check size={11} className="inline mr-1 -mt-0.5" />}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget (optional)"
                className="bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/60 transition-all" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)"
                className="bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/60 transition-all" />
            </div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email — get the estimate + a human follow-up (optional)"
              className="w-full bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/60 transition-all" />

            <button type="submit" disabled={status === "loading"}
              className="group relative w-full py-4 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.25em] overflow-hidden hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] transition-all disabled:opacity-60">
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {status === "loading" ? "Calculating…" : "Generate my estimate"}
                {status !== "loading" && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#bd00ff] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {status === "error" && <p className="text-red-400/90 text-sm">{errorMsg}</p>}
          </motion.form>

          {/* ── Result ───────────────────────────────────────────── */}
          <div ref={resultRef} className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {status === "loading" && <LoadingCard key="l" />}
              {status === "done" && estimate && <ResultCard key="r" e={estimate} emailed={emailed} money={money} />}
              {status !== "done" && status !== "loading" && <EmptyCard key="e" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 min-h-[320px] flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mb-5">
        <Sparkles size={22} className="text-[#00f0ff]" />
      </div>
      <p className="text-white/50 text-sm max-w-xs leading-relaxed">Your instant estimate appears here — price range, timeline, tech stack, and a phase-by-phase plan.</p>
    </motion.div>
  );
}

function LoadingCard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 min-h-[320px]">
      <div className="animate-pulse space-y-5">
        <div className="h-3 w-2/3 bg-white/10 rounded-full" />
        <div className="h-12 w-1/2 bg-white/10 rounded-2xl" />
        <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="h-6 w-16 bg-white/10 rounded-full" />)}</div>
        <div className="space-y-3 pt-2">{[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-white/10 rounded-full" style={{ width: `${90 - i * 12}%` }} />)}</div>
      </div>
      <p className="mt-6 text-center text-white/40 text-sm">Architecting your estimate…</p>
    </motion.div>
  );
}

function ResultCard({ e, emailed, money }: { e: Estimate; emailed: boolean; money: (n: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const low = useCountUp(e.priceLow, inView);
  const high = useCountUp(e.priceHigh, inView);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="rounded-3xl border border-[#00f0ff]/25 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-7 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.10)]">
      <p className="text-white/60 text-sm leading-relaxed mb-6">{e.summary}</p>

      <div className="flex items-end gap-2 flex-wrap">
        <span className="font-display font-black tracking-tighter text-[clamp(2.25rem,7vw,3.5rem)] leading-none">
          {money(low)}<span className="text-white/40">–</span>{money(high)}
        </span>
        <span className="text-white/40 text-sm mb-1.5">{e.currency}</span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50 mt-3 mb-7">
        <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-[#00f0ff]" /> ~{e.timelineWeeks} weeks</span>
        <span className="inline-flex items-center gap-1.5"><Layers size={13} className="text-[#00f0ff]" /> {e.recommendedPlan} plan</span>
      </div>

      {e.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-7">
          {e.techStack.map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wide bg-white/5 border border-white/10 text-white/60 px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* phase timeline */}
      <div className="relative pl-6 space-y-5 mb-7">
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-[#00f0ff]/60 to-white/10" />
        {e.phases.map((p, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-[#00f0ff]/20 border border-[#00f0ff]/60 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
            </span>
            <p className="text-sm text-white font-medium">{p.name} <span className="text-white/30 font-normal">· ~{p.weeks}w</span></p>
            <p className="text-xs text-white/50 leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>

      {e.notes && <p className="text-xs text-white/40 leading-relaxed mb-4 border-t border-white/10 pt-5">{e.notes}</p>}
      {emailed && (
        <p className="text-xs text-[#00f0ff] mb-6 flex items-center gap-1.5">
          <Check size={13} /> Sent to your inbox — check your email for the full breakdown.
        </p>
      )}

      <Link to={`/checkout?plan=${encodeURIComponent(e.recommendedPlan)}`}
        className="group flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#00f0ff] text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:shadow-[0_0_40px_rgba(0,240,255,0.45)] transition-all">
        Start this project <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </Link>
      <p className="text-[10px] text-white/30 text-center mt-3">Estimate is a guide — final scope is confirmed in a proposal.</p>
    </motion.div>
  );
}
