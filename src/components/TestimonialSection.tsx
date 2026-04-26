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

  const xText = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  // Pre-defined desktop positions for scattering cards
  const desktopClasses = [
    "lg:top-auto lg:bottom-[10%] lg:left-[5%] lg:right-auto",
    "lg:top-[15%] lg:bottom-auto lg:left-[40%] lg:right-auto",
    "lg:top-auto lg:bottom-[35%] lg:left-auto lg:right-[5%]",
    "lg:top-[10%] lg:bottom-auto lg:left-auto lg:right-[15%]",
    "lg:top-[45%] lg:bottom-auto lg:left-[10%] lg:right-auto",
    "lg:top-auto lg:bottom-[5%] lg:left-[30%] lg:right-auto",
  ];

  return (
    <section className="relative w-full bg-brand-bg text-white overflow-hidden py-24 lg:h-[300vh]" ref={containerRef}>
      {/* Mobile Layout: Normal vertical scroll */}
      <div className="block lg:hidden px-4 md:px-8 space-y-6 relative z-10 w-full max-w-md mx-auto">
        <div className="mb-12">
          <h2 className="text-5xl font-bold tracking-tighter uppercase break-words">TESTIMONIALS</h2>
        </div>
        {TESTIMONIALS.map((testi, i) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            key={i}
            className="w-full bg-[#111] p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between"
          >
            <p className="text-base md:text-xl font-medium leading-relaxed tracking-tight text-white/90">
              {testi.text}
            </p>
            
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-white/70">{testi.author}</span>
              <div className="text-sm font-bold capitalize text-white">
                {testi.logo}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Layout: Sticky scattered scroll */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Huge background text */}
        <motion.div 
          className="absolute whitespace-nowrap text-[20vw] font-bold leading-none tracking-tighter opacity-100 z-0 pointer-events-none top-1/2 -translate-y-1/2"
          style={{ x: xText }}
        >
          TESTIMONIALS
        </motion.div>

        {/* Cards container */}
        <div className="relative w-full h-full max-w-7xl mx-auto z-10 px-8">
          <div className="relative w-full h-full">
            {TESTIMONIALS.map((testi, i) => {
              // Scroll animations mapped to segments of scroll duration
              const start = (i / TESTIMONIALS.length) * 0.8;
              
              const yEnter = useTransform(
                scrollYProgress,
                [Math.max(0, start - 0.15), start],
                ["50vh", "0vh"]
              );
              
              const opacityCard = useTransform(
                scrollYProgress,
                [Math.max(0, start - 0.1), start],
                [0, 1]
              );
              
              // Rotate from random angle to 0
              const rotateEnter = useTransform(
                scrollYProgress,
                [Math.max(0, start - 0.15), start],
                [i % 2 === 0 ? 10 : -10, 0]
              );
              
              const posClass = desktopClasses[i % desktopClasses.length];

              return (
                <div
                  key={i}
                  className={`absolute w-[350px] ${posClass}`}
                >
                  <motion.div
                    className="w-full h-fit bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between"
                    style={{
                      y: yEnter,
                      opacity: opacityCard,
                      rotate: rotateEnter,
                      zIndex: i + 10,
                    }}
                  >
                    <p className="text-lg xl:text-xl font-medium leading-relaxed tracking-tight text-white/90">
                      {testi.text}
                    </p>
                    
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest uppercase text-white/70">{testi.author}</span>
                      <div className="text-sm font-bold capitalize text-white">
                        {testi.logo}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
