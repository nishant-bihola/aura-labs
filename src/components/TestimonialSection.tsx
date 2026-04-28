import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

const TESTIMONIALS = [
  {
    text: `"Working with Aura Labs felt like having an internal team rather than an external agency. They were proactive, detail-oriented, and invested in the outcome."`,
    author: "DANIEL MORGAN",
    logo: "acme"
  },
  {
    text: `"Their ability to listen, challenge assumptions, and translate ideas into a clean digital system made a real difference for our brand."`,
    author: "ELENA ROSSI",
    logo: "FR"
  },
  {
    text: `"We didn't just get a website — we got a solid digital foundation. Aura Labs is the kind of partner you want when building something meant to last."`,
    author: "MICHAEL TURNER",
    logo: "Radius"
  },
  {
    text: `"The final product wasn't just beautiful — it performed. Aura Labs helped us improve conversion, simplify our messaging, and build a system we scale."`,
    author: "JAMES WHITAKER",
    logo: "Alt+Shift"
  },
  {
    text: `"Aura Labs brought clarity to a very complex project. Their ability to listen, challenge assumptions, and translate ideas into a clean digital system."`,
    author: "LAURA BIANCHI",
    logo: "Square"
  },
  {
    text: `"What stood out with Aura Labs was the balance between design quality and technical execution. Everything was thoughtful, scalable, and built with purpose."`,
    author: "SOPHIA KLEIN",
    logo: "Globe"
  },
  {
    text: `"They redefined our digital presence with a level of sophistication we didn't think possible in such a short timeframe."`,
    author: "MARCUS CHENG",
    logo: "Apex"
  },
  {
    text: `"Aura Labs is simply in a league of their own. The attention to micro-interactions and performance is world-class."`,
    author: "SARAH JENKINS",
    logo: "Flow"
  },
  {
    text: `"The most collaborative agency we've ever worked with. They truly understand the intersection of brand and technology."`,
    author: "OLIVER VOSS",
    logo: "Nordic"
  },
  {
    text: `"Every detail was considered. From the custom cursor to the load transitions, it's a masterpiece."`,
    author: "ISABELLA GOMEZ",
    logo: "Verve"
  }
];

const BACKGROUND_WORD = "TESTIMONIALS";

export default function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background text parallax and reveal
  const xText = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);
  
  // Card positions and parallax speeds
  // We'll give each card a different "depth" (parallax factor)
  const cardConfigs = [
    { left: "10%", initialY: "110vh", targetY: "-150vh", speed: 1.2, delay: 0 },
    { left: "60%", initialY: "140vh", targetY: "-130vh", speed: 1.5, delay: 0.1 },
    { left: "15%", initialY: "170vh", targetY: "-110vh", speed: 0.8, delay: 0.2 },
    { left: "55%", initialY: "200vh", targetY: "-180vh", speed: 2.0, delay: 0.3 },
    { left: "5%", initialY: "240vh", targetY: "-140vh", speed: 1.1, delay: 0.4 },
    { left: "65%", initialY: "280vh", targetY: "-160vh", speed: 1.4, delay: 0.5 },
    { left: "20%", initialY: "320vh", targetY: "-120vh", speed: 0.9, delay: 0.6 },
    { left: "50%", initialY: "360vh", targetY: "-200vh", speed: 1.8, delay: 0.7 },
    { left: "12%", initialY: "400vh", targetY: "-100vh", speed: 0.7, delay: 0.8 },
    { left: "58%", initialY: "440vh", targetY: "-170vh", speed: 1.6, delay: 0.9 },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative w-full bg-brand-bg text-white overflow-hidden h-[600vh] select-none"
    >
      {/* Sticky Background Word */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">
        <motion.div 
          className="flex whitespace-nowrap"
          style={{ x: xText }}
        >
          {BACKGROUND_WORD.split("").map((letter, i) => {
            // Letter reveal animation: slides up from bottom
            const yLetter = useTransform(
              smoothProgress,
              [0, 0.15 + i * 0.02, 0.25 + i * 0.02],
              ["110%", "0%", "0%"]
            );
            const opacityLetter = useTransform(
              smoothProgress,
              [0, 0.1 + i * 0.02, 0.2 + i * 0.02],
              [0, 0, 0.08]
            );

            return (
              <div key={i} className="overflow-hidden">
                <motion.span
                  className="inline-block text-[35vw] md:text-[25vw] font-display leading-none tracking-tighter"
                  style={{ y: yLetter, opacity: opacityLetter }}
                >
                  {letter}
                </motion.span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Parallax Cards */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="relative w-full h-full max-w-[1400px] mx-auto px-6">
          {TESTIMONIALS.map((testi, i) => {
            const config = cardConfigs[i % cardConfigs.length];
            
            // Map the entire scroll progress to this card's vertical journey
            const y = useTransform(
              smoothProgress,
              [0, 1],
              [config.initialY, config.targetY]
            );

            // Fade in/out as it passes through the viewport
            // The card is "visible" when its Y position is roughly between -20vh and 120vh
            const opacity = useTransform(
              y,
              ["100vh", "80vh", "20vh", "-20vh"],
              [0, 1, 1, 0]
            );

            // Slight rotation for that organic floaty feel
            const rotate = useTransform(
              smoothProgress,
              [0, 1],
              [i % 2 === 0 ? 5 : -5, i % 2 === 0 ? -5 : 5]
            );

            return (
              <motion.div
                key={i}
                className="absolute w-[85%] max-w-[320px] md:max-w-[400px] pointer-events-auto will-change-transform z-10"
                style={{
                  left: config.left,
                  y,
                  opacity,
                  rotate,
                }}
              >
                <div className="group relative bg-[#111] backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-500 hover:bg-[#151515] hover:border-white/10">
                  {/* Quote Icon or Logo */}
                  <div className="mb-8 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 font-serif italic text-xl">“</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40 transition-colors">
                      {testi.logo}
                    </div>
                  </div>

                  <p className="text-[14px] md:text-[16px] lg:text-[18px] font-medium leading-relaxed tracking-tight text-white/90 balance-text">
                    {testi.text}
                  </p>
                  
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/40">
                        {testi.author}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.1em] text-white/20 mt-1">
                        Aura Labs Partner
                      </span>
                    </div>
                  </div>

                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom spacer to prevent abrupt end */}
      <div className="absolute bottom-0 w-full h-[20vh] bg-gradient-to-t from-brand-bg to-transparent pointer-events-none z-20" />
    </section>
  );
}
