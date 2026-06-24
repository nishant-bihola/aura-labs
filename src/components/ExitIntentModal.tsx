import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { getVariant, trackConversion } from "../lib/ab";

const SESSION_FLAG = "aura_exit_shown";

const HEADLINES: Record<string, { title: string; sub: string }> = {
  a: { title: "Leaving so soon?", sub: "Get a free, instant AI estimate for your project — price, timeline, and tech stack in seconds." },
  b: { title: "Know your budget first.", sub: "Describe your idea and our AI architect returns a real price range and timeline — no email required." },
};

/**
 * Exit-intent prompt: nudges leaving visitors to the AI estimator.
 * Shows once per session — on desktop when the cursor leaves the top of the
 * viewport, on touch devices after a dwell + scroll. A/B tested headline.
 */
export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [variant] = useState(() => getVariant("exit_intent", ["a", "b"]));

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    const trigger = () => {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, "1");
      setOpen(true);
      cleanup();
    };

    const onMouseOut = (e: MouseEvent) => {
      // cursor left through the top of the window
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isTouch) {
      // fire after a dwell, but only once they've engaged (scrolled a bit)
      timer = setTimeout(() => {
        if (window.scrollY > window.innerHeight * 0.6) trigger();
      }, 30000);
    } else {
      document.addEventListener("mouseout", onMouseOut);
    }

    function cleanup() {
      document.removeEventListener("mouseout", onMouseOut);
      if (timer) clearTimeout(timer);
    }
    return cleanup;
  }, []);

  const copy = HEADLINES[variant] || HEADLINES.a;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.12)]"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00f0ff]/20 blur-[80px] rounded-full pointer-events-none" />
            <button onClick={() => setOpen(false)} aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60">
              <X size={16} />
            </button>

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#00f0ff]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">AI Estimator</span>
              </div>
              <h2 className="font-valtero-serif italic text-3xl md:text-4xl tracking-tight mb-3 text-white">{copy.title}</h2>
              <p className="text-white/55 leading-relaxed mb-8">{copy.sub}</p>

              <Link
                to="/estimate"
                onClick={() => { trackConversion("exit_intent", variant); setOpen(false); }}
                className="group flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#00f0ff] text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-all"
              >
                Get my free estimate
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button onClick={() => setOpen(false)} className="mt-4 w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors">
                No thanks, keep browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
