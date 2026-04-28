import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden border-x border-border-soft mx-3 md:mx-6">
      
      {/* Corner Labels - Hidden on small mobile */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex justify-between px-8 pointer-events-none hidden md:flex">
         {/* Desktop overlay text */}
      </div>

      <div className="absolute bottom-6 left-6 md:left-8 flex flex-col gap-1 text-[8px] md:text-[10px] uppercase kerning-wide font-bold opacity-40 md:opacity-60">
        <span>Web Design</span>
        <span>Social Media</span>
        <span>Marketing</span>
        <span>Development</span>
      </div>

      <div className="absolute bottom-6 right-6 md:right-8 text-[8px] md:text-[10px] uppercase kerning-wide font-bold opacity-40 md:opacity-60">
        Featured Work /04
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.3em] opacity-30 md:opacity-40">Explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={12} className="opacity-30 md:opacity-40" />
        </motion.div>
      </div>

      {/* Huge Centered Text */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
           className="relative w-full"
        >
          <h1 className="fluid-h1 leading-[0.75] font-black uppercase font-display tracking-tight text-white flex flex-wrap items-center justify-center balance-text">
            {"AURA LABS".split("").map((char, i) => (
              char === " " ? (
                <span key={i} className="w-[4vw]">&nbsp;</span>
              ) : (
                <motion.span
                  key={i}
                  className="inline-block origin-bottom"
                  whileHover={{ 
                    scaleY: 1.4, 
                    scaleX: 0.8,
                    y: -10,
                    skewX: -15,
                    color: "rgba(255,255,255,0.8)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {char}
                </motion.span>
              )
            ))}
            <span className="inline-flex items-center justify-center ml-[2vw] relative group">
               <motion.div 
                 whileHover={{ rotate: 180, scale: 1.1 }}
                 transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                 className="w-[12vw] h-[12vw] md:w-[10vw] md:h-[10vw] border-[0.8vw] md:border-[0.8vw] border-white rounded-full flex items-center justify-center relative cursor-pointer overflow-hidden backdrop-blur-sm bg-white/5"
               >
                  <div className="w-[7vw] h-[7vw] md:w-[6vw] md:h-[6vw] border-[0.4vw] md:border-[0.4vw] border-white rounded-full flex items-center justify-center select-none">
                     <motion.span 
                        className="text-[3.5vw] md:text-[3vw] leading-none mb-[0.2vw] md:mb-[0.5vw]"
                        whileHover={{ scale: 1.5, rotate: 90 }}
                     >
                       C
                     </motion.span>
                  </div>
               </motion.div>
            </span>
          </h1>
        </motion.div>
        
        <div className="max-w-[280px] md:max-w-xl mt-8 md:mt-12">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-[10px] md:text-xs uppercase kerning-wide font-bold leading-relaxed text-center opacity-60 tracking-[0.2em]"
            >
              We design and build digital experiences through strategy, branding, and technology.
            </motion.p>
        </div>
      </div>

    </section>
  );
}
