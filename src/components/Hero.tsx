import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { heroProgress, heroPointer } from "./canvas/frozen/progress";
import HeroBackground from "./canvas/HeroBackground";
import { getVariant, trackConversion } from "../lib/ab";


const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  // A/B test the primary CTA copy + destination (tracked in Vercel Analytics).
  const [ctaVariant] = useState(() => getVariant("hero_cta", ["a", "b"]));

  // mount the canvas after first paint so the headline lands instantly.
  // Start fetching the (lazy) 3D scene chunk right away in parallel, so it is
  // already downloading by the time the canvas mounts — the diamond appears
  // noticeably sooner, especially on mobile.
  useEffect(() => {
    import("./canvas/frozen/FrozenHeroScene");
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

    const setPointer = (clientX: number, clientY: number) => {
      heroPointer.x = (clientX / window.innerWidth) * 2 - 1;
      heroPointer.y = (clientY / window.innerHeight) * 2 - 1;
    };
    const onMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <section
      ref={section}
      className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden border-x border-white/5 mx-3 md:mx-6"
    >
      {/* 1. Static CSS Aurora Background — rendered immediately so the site has an instant premium backdrop */}
      <div className="absolute inset-0 overflow-hidden bg-[#04060a]" aria-hidden>
        <div className="aurora-blob aurora-blob--cyan" />
        <div className="aurora-blob aurora-blob--violet" />
        <div className="aurora-blob aurora-blob--ice" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,240,255,0.10),transparent_55%)]" />
      </div>

      {/* 2. The dynamic 3D frozen world (lazy WebGL) — crossfades in smoothly once loaded */}
      <div
        className={`absolute inset-0 z-[2] transition-opacity duration-[1200ms] ease-out ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {mounted && (
          <HeroBackground onReady={() => setReady(true)} />
        )}
      </div>

      {/* cinematic edge gradients to seat the type */}
      <div className="absolute inset-0 z-[6] pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      {/* 2. DOM layer */}
      <div ref={content} className="relative z-10 flex flex-col items-center text-center px-4 w-full will-change-transform">
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
                transition={{ duration: 0.6, delay: 0.08 + i * 0.028, ease: EASE_EXPO }}
              >
                {char}
              </motion.span>
            )
          )}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE_EXPO }}
          className="max-w-[300px] md:max-w-xl mt-10 md:mt-12 text-[10px] md:text-xs uppercase font-bold leading-relaxed text-white/85 md:text-white/55 tracking-[0.3em]"
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
          transition={{ delay: 0.6, duration: 0.6, ease: EASE_EXPO }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to={ctaVariant === "b" ? "/estimate" : "/contact"}
            onClick={() => trackConversion("hero_cta", ctaVariant)}
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 hover:bg-[#00f0ff] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)]"
          >
            {ctaVariant === "b" ? "Get a free estimate" : "Book a strategy call"}
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
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-6 left-6 md:left-8 z-10 flex flex-col gap-1 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 md:opacity-60"
      >
        <span>Web Development</span>
        <span>AI Chatbots</span>
        <span>AI Ad Content</span>
        <span>Web Apps</span>
      </motion.div>

    </section>
  );
}
