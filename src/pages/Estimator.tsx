import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock, Layers, Check } from "lucide-react";

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

export default function Estimator() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

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
      setStatus("done");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans selection:bg-[#00f0ff] selection:text-black">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#00f0ff]" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">AI Project Estimator</span>
        </div>
        <h1 className="font-valtero-serif italic text-4xl md:text-6xl tracking-tight leading-[0.95] mb-4">
          Get an instant estimate.
        </h1>
        <p className="text-white/50 max-w-xl mb-12 leading-relaxed">
          Describe what you want to build. Our AI architect returns a realistic price range, timeline,
          recommended plan, and a phase-by-phase breakdown — in seconds.
        </p>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-3">Your project</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="e.g. A booking website for my salon with online payments, a customer login, and an AI chatbot that answers FAQs and books appointments."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/50 focus:bg-white/10 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-3">What do you need? (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggle(s)}
                    className={`text-xs px-4 py-2 rounded-full border transition-all ${
                      selected.includes(s)
                        ? "bg-[#00f0ff]/15 border-[#00f0ff]/50 text-[#00f0ff]"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget (optional)"
                className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/50 transition-all" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)"
                className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/50 transition-all" />
            </div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email — get the estimate + a human follow-up (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/50 transition-all" />

            <button type="submit" disabled={status === "loading"}
              className="w-full py-4 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#00f0ff] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] transition-all disabled:opacity-60">
              {status === "loading" ? "Calculating…" : "Generate my estimate"}
            </button>
            {status === "error" && <p className="text-red-400/80 text-sm">{errorMsg}</p>}
          </form>

          {/* Result */}
          <div className="lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-pulse min-h-[300px] flex items-center justify-center text-white/40 text-sm">
                  Architecting your estimate…
                </motion.div>
              )}

              {status === "done" && estimate && (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-[#00f0ff]/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
                  <p className="text-white/60 text-sm leading-relaxed mb-6">{estimate.summary}</p>

                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-4xl md:text-5xl font-serif tracking-tight text-white">
                      {money(estimate.priceLow)}–{money(estimate.priceHigh)}
                    </span>
                    <span className="text-white/40 text-sm mb-1.5">{estimate.currency}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-8">
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-[#00f0ff]" /> ~{estimate.timelineWeeks} weeks</span>
                    <span className="inline-flex items-center gap-1.5"><Layers size={13} className="text-[#00f0ff]" /> {estimate.recommendedPlan} plan</span>
                  </div>

                  {estimate.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {estimate.techStack.map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wide bg-white/5 border border-white/10 text-white/60 px-3 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {estimate.phases.map((p, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-[#00f0ff]" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{p.name} <span className="text-white/30 font-normal">· ~{p.weeks}w</span></p>
                          <p className="text-xs text-white/50 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {estimate.notes && <p className="text-xs text-white/40 leading-relaxed mb-8 border-t border-white/10 pt-5">{estimate.notes}</p>}

                  <Link to={`/checkout?plan=${encodeURIComponent(estimate.recommendedPlan)}`}
                    className="block text-center w-full py-4 rounded-full bg-[#00f0ff] text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all">
                    Start this project
                  </Link>
                  <p className="text-[10px] text-white/30 text-center mt-3">Estimate is a guide — final scope is confirmed in a proposal.</p>
                </motion.div>
              )}

              {status !== "done" && status !== "loading" && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
                  <Sparkles size={28} className="text-white/20 mb-4" />
                  <p className="text-white/40 text-sm max-w-xs">Your estimate will appear here — price range, timeline, stack, and phases.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
