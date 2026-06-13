import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { heroProgress, heroPointer } from "./canvas/frozen/progress";
import FrozenHeroScene from "./canvas/frozen/FrozenHeroScene";


const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  // mount the canvas after first paint so the headline lands instantly
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  // scroll progress (0 → 1 as the hero exits) + content choreography
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = section.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(Math.max(-rect.top / (vh * 0.9), 0), 1);
        heroProgress.value = p;

        // the DOM layer sinks and dissolves slightly faster than the camera
        if (content.current) {
          const fade = Math.min(p * 1.6, 1);
          content.current.style.opacity = String(1 - fade);
          content.current.style.transform = `translateY(${p * -90}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      heroPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      heroPointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      ref={section}
      className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden border-x border-white/5 mx-3 md:mx-6"
    >
      {/* 1. The frozen world */}
      {mounted && (
        <FrozenHeroScene onReady={() => setReady(true)} />
      )}

      {/* boot veil — lifts once the GL context reports in */}
      <div
        className={`absolute inset-0 z-[5] bg-black pointer-events-none transition-opacity duration-[1400ms] ease-out ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* cinematic edge gradients to seat the type */}
      <div className="absolute inset-0 z-[6] pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      {/* 2. DOM layer */}
      <div ref={content} className="relative z-10 flex flex-col items-center text-center px-4 w-full will-change-transform">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00f0ff]" />
          </span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">
            Systems online — AI that works while you sleep
          </span>
        </motion.div>

        <h1 className="fluid-h1 leading-[0.78] font-black uppercase font-display tracking-tighter text-white relative">
          {/* glowing backdrop */}
          <span
            className="absolute inset-0 blur-[44px] text-[#00f0ff]/25 mix-blend-screen pointer-events-none select-none"
            aria-hidden
          >
            AURA LABS
          </span>
          {"AURA LABS".split("").map((char, i) =>
            char === " " ? (
              <span key={i} className="inline-block w-[3vw]" />
            ) : (
              <motion.span
                key={i}
                className="inline-block origin-bottom px-[0.3vw] text-white transition-all duration-300 ease-out hover:text-[#00f0ff] hover:-translate-y-[12px] cursor-default"
                style={{ textShadow: "0 0 18px rgba(0,240,255,0.18)" }}
                initial={{ opacity: 0, y: 60, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.35 + i * 0.045, ease: EASE_EXPO }}
              >
                {char}
              </motion.span>
            )
          )}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1, ease: EASE_EXPO }}
          className="max-w-[300px] md:max-w-xl mt-10 md:mt-12 text-[10px] md:text-xs uppercase font-bold leading-relaxed text-white/50 tracking-[0.3em]"
        >
          Architecting the{" "}
          <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            digital future
          </span>{" "}
          with high-performance SaaS, AI, and enterprise interfaces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 1, ease: EASE_EXPO }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 hover:bg-[#00f0ff] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)]"
          >
            Book a strategy call
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:rotate-45" />
          </Link>
          <Link
            to="/#work"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-7 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold text-white/80 transition-all duration-500 hover:border-[#00f0ff]/60 hover:text-white"
          >
            View work
          </Link>
        </motion.div>
      </div>

      {/* 3. Corner HUD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 1.2 }}
        className="absolute bottom-6 left-6 md:left-8 z-10 flex flex-col gap-1 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 md:opacity-60"
      >
        <span>Web Development</span>
        <span>AI Chatbots</span>
        <span>AI Ad Content</span>
        <span>Web Apps</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 1.2 }}
        className="absolute bottom-6 right-6 md:right-8 z-10 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 md:opacity-60"
      >
        Core temp −42°C / Live render
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/40">
          Scroll
        </span>
        <span className="block h-8 w-px overflow-hidden bg-white/10">
          <motion.span
            animate={{ y: [0, 32] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="block h-3 w-px bg-[#00f0ff]"
          />
        </span>
      </motion.div>
    </section>
  );
}
