import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const TESTIMONIALS = [
  {
    text: `"Working with Aura Labs felt like having an internal team rather than an external agency. They were proactive, detail-oriented, and genuinely invested in the outcome."`,
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
    text: `"The final product wasn't just beautiful — it performed. Aura Labs helped us improve conversion, simplify our messaging, and build a system we can confidently scale."`,
    author: "JAMES WHITAKER",
    logo: "Alt+Shift"
  },
  {
    text: `"Aura Labs brought clarity to a very complex project. Their ability to listen, challenge assumptions, and translate ideas into a clean digital system."`,
    author: "LAURA BIANCHI",
    logo: "Square"
  },
  {
    text: `"What stood out with Aura Labs was the balance between design quality and technical execution. Everything was thoughtful, scalable, and built with term use in mind."`,
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

export default function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Reveal effect for the background text
  const textRevealWidth = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"]);

  // Multi-viewport positions to prevent stacking
  const cardPositions = [
    "top-[15%] left-[10%] md:left-[15%]",
    "top-[25%] left-[20%] md:left-[55%]",
    "top-[55%] left-[5%] md:left-[12%]",
    "top-[15%] left-[30%] md:right-[20%]",
    "top-[45%] left-[10%] md:right-[10%]",
    "top-[65%] left-[15%] md:left-[45%]",
    "top-[10%] left-[40%] md:left-[25%]",
    "top-[60%] left-[20%] md:right-[25%]",
    "top-[35%] left-[15%] md:left-[20%]",
    "top-[75%] left-[10%] md:right-[15%]",
  ];

  return (
    <section className="relative w-full bg-brand-bg text-white overflow-hidden h-[400vh] lg:h-[500vh]" ref={containerRef}>
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Reveal Text */}
        <div className="absolute w-full flex justify-center items-center pointer-events-none select-none z-0">
          <div className="relative">
            {/* Outline Layer */}
            <h2 className="text-[30vw] md:text-[22vw] lg:text-[18vw] font-bold leading-none tracking-tighter opacity-[0.05] text-outline">
              TESTIMONIALS
            </h2>
            {/* Fill Layer */}
            <motion.h2 
              className="absolute top-0 left-0 text-[30vw] md:text-[22vw] lg:text-[18vw] font-bold leading-none tracking-tighter text-white opacity-[0.08] overflow-hidden whitespace-nowrap"
              style={{ width: textRevealWidth }}
            >
              TESTIMONIALS
            </motion.h2>
          </div>
        </div>

        {/* Cards container */}
        <div className="relative w-full h-full max-w-7xl mx-auto z-10 px-4 md:px-8">
          <div className="relative w-full h-full">
            {TESTIMONIALS.map((testi, i) => {
              // Map cards to the text fill progress
              const totalCards = TESTIMONIALS.length;
              const start = (i / totalCards) * 0.85;
              const end = start + 0.18; // Overlap for readability
              
              const yEnter = useTransform(
                scrollYProgress,
                [start, start + 0.05],
                ["30vh", "0vh"]
              );
              
              const opacityCard = useTransform(
                scrollYProgress,
                [start, start + 0.05, end - 0.05, end],
                [0, 1, 1, 0]
              );
              
              const scaleCard = useTransform(
                scrollYProgress,
                [start, start + 0.05],
                [0.95, 1]
              );
              
              const rotateEnter = useTransform(
                scrollYProgress,
                [start, start + 0.05],
                [i % 2 === 0 ? 3 : -3, 0]
              );
              
              const posClass = cardPositions[i % cardPositions.length];

              return (
                <motion.div
                  key={i}
                  className={`absolute w-[85%] max-w-[280px] md:max-w-[340px] lg:w-[380px] ${posClass} will-change-transform`}
                  style={{
                    y: yEnter,
                    opacity: opacityCard,
                    rotate: rotateEnter,
                    scale: scaleCard,
                    zIndex: i + 10,
                  }}
                >
                  <div className="w-full h-fit bg-white/[0.02] backdrop-blur-3xl p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between group transition-all duration-700 hover:bg-white/[0.04] hover:border-white/10">
                    <p className="text-[12px] md:text-[14px] lg:text-[16px] font-medium leading-relaxed tracking-tight text-white/80 balance-text group-hover:text-white transition-colors duration-500">
                      {testi.text}
                    </p>
                    
                    <div className="mt-8 md:mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-white/40">{testi.author}</span>
                        <span className="text-[8px] uppercase tracking-widest text-white/20">Aura Labs Partner</span>
                      </div>
                      <div className="text-[10px] md:text-xs font-black uppercase tracking-tighter italic text-white/20 group-hover:text-white/60 transition-colors">
                        {testi.logo}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
