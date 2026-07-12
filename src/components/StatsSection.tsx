import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 12, suffix: "+", label: "Projects shipped", sub: "Live products in production" },
  { value: 100, suffix: "%", label: "Client focus", sub: "Every build, obsessively polished" },
  { value: 48, suffix: "h", label: "Ad turnaround", sub: "Motion ads, delivered fast" },
  { value: 24, suffix: "/7", label: "AI support", sub: "Chatbots that never sleep" },
];

function useCountUp(target: number, run: boolean, ms = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return val;
}

function Stat({ value, suffix, label, sub, run, delay }: (typeof STATS)[0] & { run: boolean; delay: number }) {
  const n = useCountUp(value, run);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={run ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="font-sans font-black tracking-tight leading-none text-[clamp(2.75rem,8vw,5.5rem)] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
        {n}
        <span className="text-[#00f0ff]">{suffix}</span>
      </div>
      <p className="mt-3 text-sm md:text-base font-bold text-white uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xs md:text-sm text-white/40 leading-relaxed">{sub}</p>
      <span className="absolute -bottom-4 left-0 h-px w-0 bg-gradient-to-r from-[#00f0ff] to-transparent group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-black border-x border-white/5 mx-3 md:mx-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,240,255,0.08),transparent_60%)]" />
      <div ref={ref} className="relative max-w-7xl mx-auto fluid-px py-20 md:py-32">
        <div className="flex items-center gap-3 opacity-60 mb-12 md:mb-16">
          <span className="w-12 h-px bg-white" />
          <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium">By the numbers</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 md:gap-y-20">
          {STATS.map((s, i) => (
            <Stat key={s.label} {...s} run={inView} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
