import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { heroProgress, heroPointer } from "./canvas/frozen/progress";
import HeroBackground from "./canvas/HeroBackground";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Live HUD States
  const [sysTime, setSysTime] = useState("");
  const [latency, setLatency] = useState(11);
  const [fps, setFps] = useState(60);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Mount the canvas after first paint so the headline lands instantly.
  useEffect(() => {
    import("./canvas/frozen/FrozenHeroScene");
    const id = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  // Scroll progress (0 → 1 as the hero exits) + content choreography + HUD updates
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = section.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(Math.max(-rect.top / (vh * 0.9), 0), 1);
        heroProgress.value = p;

        // The DOM layer sinks and dissolves slightly faster than the camera
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
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = (clientY / window.innerHeight) * 2 - 1;
      heroPointer.x = x;
      heroPointer.y = y;
      setCoords({ x, y });
    };

    const onMove = (e: PointerEvent) => {
      setPointer(e.clientX, e.clientY);
      const el = section.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        el.style.setProperty("--mouse-x", `${relX}px`);
        el.style.setProperty("--mouse-y", `${relY}px`);
      }
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        setPointer(t.clientX, t.clientY);
        const el = section.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const relX = t.clientX - rect.left;
          const relY = t.clientY - rect.top;
          el.style.setProperty("--mouse-x", `${relX}px`);
          el.style.setProperty("--mouse-y", `${relY}px`);
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });

    // Live HUD updates
    const hudInterval = setInterval(() => {
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, "0").slice(0, 2);
      const timeStr = `${now.toISOString().slice(11, 19)}.${ms} UTC`;
      setSysTime(timeStr);

      setLatency((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(7, Math.min(15, prev + change));
      });
    }, 100);

    // Track FPS
    let frames = 0;
    let lastTime = performance.now();
    let fpsRaf = 0;
    const calculateFps = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      fpsRaf = requestAnimationFrame(calculateFps);
    };
    fpsRaf = requestAnimationFrame(calculateFps);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fpsRaf);
      clearInterval(hudInterval);
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
      <div 
        ref={glowRef}
        className="absolute inset-0 z-[1] opacity-35 pointer-events-none transition-opacity duration-1000 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 240, 255, 0.05), transparent 45%)`
        }}
      />

      {/* Interactive Cyber Blueprint Grid */}
      <div 
        className="absolute inset-0 z-[2] opacity-[0.18] pointer-events-none mix-blend-screen hidden md:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 30%, transparent 100%)"
        }}
      />

      {/* Static fine grid for base structure */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.06] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {mounted && (
        <HeroBackground onReady={() => setReady(true)} />
      )}

      <div
        className={`absolute inset-0 z-[5] bg-black pointer-events-none transition-opacity duration-[700ms] ease-out ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="absolute inset-0 z-[6] pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      <div ref={content} className="relative z-10 flex flex-col items-center text-center px-4 w-full will-change-transform">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE_EXPO }}
          className="mb-6 flex items-center gap-3 rounded-full border border-[#00f0ff]/20 bg-[#00f0ff]/5 px-4 py-1.5 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-extrabold text-[#00f0ff] backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.07)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
          <span>Next-Gen Creative Engineering</span>
        </m.div>

        <h1 className="fluid-h1 leading-[0.78] font-black uppercase font-display tracking-tighter text-white relative">
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
              <m.span
                key={i}
                className="inline-block origin-bottom px-[0.3vw] text-white transition-all duration-300 ease-out hover:text-[#00f0ff] hover:-translate-y-[12px] cursor-default"
                style={{ textShadow: "0 0 18px rgba(0,240,255,0.18)" }}
                initial={{ opacity: 0, y: 60, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 0.08 + i * 0.028, ease: EASE_EXPO }}
              >
                {char}
              </m.span>
            )
          )}
        </h1>

        <m.p
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
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE_EXPO }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 hover:bg-[#00f0ff] hover:shadow-[0_0_40px_rgba(0,240,255,0.35)] focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
          >
            Book a strategy call
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:rotate-45" />
          </Link>
          <Link
            to="/#work"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-7 py-3.5 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold text-white/80 transition-all duration-500 hover:border-[#00f0ff]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
          >
            View work
          </Link>
        </m.div>
      </div>

      <m.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.5, y: [0, 8, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer pointer-events-none"
      >
        <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/40">Scroll</span>
        <div className="w-[16px] h-[28px] rounded-full border border-white/20 flex justify-center p-[3px]">
          <m.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[3px] h-[5px] bg-[#00f0ff] rounded-full" 
          />
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-8 left-6 md:left-8 z-10 flex flex-col gap-1.5 text-[8px] uppercase tracking-[0.2em] font-bold text-white/40 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="text-white/60">SYS STATUS: ACTIVE</span>
        </div>
        <span>PROTOCOL: HTTPS/WSS/EDGE</span>
        <span>LATENCY: {latency}ms (VERCEL EDGE)</span>
        <span>ENGINE: {fps} FPS (WEBGL)</span>
      </m.div>

      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-8 right-6 md:right-8 z-10 flex flex-col gap-1.5 text-[8px] uppercase tracking-[0.2em] font-bold text-white/40 text-right pointer-events-none"
      >
        <span>TIME: {sysTime || "LOADING..."}</span>
        <span>LOC: EDMONTON, AB, CA</span>
        <span>GRID: 53.5461° N, -113.4938° W</span>
        <span>CURSOR: X: {coords.x.toFixed(3)} / Y: {coords.y.toFixed(3)}</span>
      </m.div>
    </section>
  );
}
