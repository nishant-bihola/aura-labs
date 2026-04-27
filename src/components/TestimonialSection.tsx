import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const TESTIMONIALS = [
  {
    text: `"Working with Valtero© felt like having an internal team rather than an external agency. They were proactive, detail-oriented, and genuinely invested in the outcome."`,
    author: "DANIEL MORGAN",
    logo: "acme"
  },
  {
    text: `"Their ability to listen, challenge assumptions, and translate ideas into a clean digital system made a real difference for our brand."`,
    author: "ELENA ROSSI",
    logo: "FR"
  },
  {
    text: `"We didn't just get a website — we got a solid digital foundation. Valtero© is the kind of partner you want when building something meant to last."`,
    author: "MICHAEL TURNER",
    logo: "Radius"
  },
  {
    text: `"The final product wasn't just beautiful — it performed. Valtero© helped us improve conversion, simplify our messaging, and build a system we can confidently scale."`,
    author: "JAMES WHITAKER",
    logo: "Alt+Shift"
  },
  {
    text: `"Valtero© brought clarity to a very complex project. Their ability to listen, challenge assumptions, and translate ideas into a clean digital system."`,
    author: "LAURA BIANCHI",
    logo: "Square"
  },
  {
    text: `"What stood out with Valtero© was the balance between design quality and technical execution. Everything was thoughtful, scalable, and built with term use in mind."`,
    author: "SOPHIA KLEIN",
    logo: "Globe"
  }
];

export default function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const xText = useTransform(scrollYProgress, [0, 1], ["50%", "-150%"]);

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-brand-bg text-white overflow-hidden">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Huge background text */}
        <motion.div 
          className="absolute whitespace-nowrap text-[15rem] lg:text-[25rem] font-bold leading-none tracking-tighter opacity-100 z-0 pointer-events-none"
          style={{ x: xText }}
        >
          TESTIMONIALS
        </motion.div>

        {/* Cards container */}
        <div className="relative w-full max-w-4xl mx-auto h-full flex items-center justify-center lg:justify-end px-6 z-10">
          <div className="relative w-full max-w-sm aspect-square lg:mr-20">
            {TESTIMONIALS.map((testi, i) => {
              // We want cards to stack one by one.
              // Each card has a specific range in the scroll progress
              const start = i / TESTIMONIALS.length;
              const end = (i + 1) / TESTIMONIALS.length;
              
              const yEnter = useTransform(scrollYProgress, [Math.max(0, start - 0.2), start], ["100vh", "0vh"]);
              const opacityCard = useTransform(scrollYProgress, [Math.max(0, start - 0.1), start], [0, 1]);
              const scaleCard = useTransform(scrollYProgress, [start, end, end + 0.1], [1, 1, 0.95]);

              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 top-1/2 -translate-y-1/2 w-full h-fit bg-[#111] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between origin-top"
                  style={{
                    y: yEnter,
                    opacity: opacityCard,
                    scale: scaleCard,
                    zIndex: i + 10,
                  }}
                >
                  <p className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight text-white/90">
                    {testi.text}
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest uppercase">{testi.author}</span>
                    <span className="text-md font-bold capitalize text-white/50">{testi.logo}</span>
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
