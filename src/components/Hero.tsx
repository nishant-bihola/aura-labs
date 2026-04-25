import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden border-x border-border-soft mx-6">
      
      {/* Corner Labels */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex justify-between px-8 pointer-events-none md:hidden">
         {/* Mobile overlay text or similar if needed */}
      </div>

      <div className="absolute bottom-6 left-8 flex flex-col gap-1 text-[10px] uppercase kerning-wide font-bold opacity-60">
        <span>Web Design</span>
        <span>Social Media</span>
        <span>Marketing</span>
        <span>Development</span>
        <span>SEO Optimization</span>
      </div>

      <div className="absolute bottom-6 right-8 text-[10px] uppercase kerning-wide font-bold opacity-60">
        Featured Work /04
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-40">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={14} className="opacity-40" />
        </motion.div>
      </div>

      {/* Huge Centered Text */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
           className="relative"
        >
          <h1 className="text-[28vw] md:text-[22vw] leading-[0.75] font-black uppercase font-display tracking-tight text-white flex items-center justify-center">
            AURA LABS
            <span className="inline-flex items-center justify-center ml-[1vw] relative">
               <div className="w-[8vw] h-[8vw] md:w-[10vw] md:h-[10vw] border-[0.6vw] md:border-[0.8vw] border-white rounded-full flex items-center justify-center">
                  <div className="w-[5vw] h-[5vw] md:w-[6vw] md:h-[6vw] border-[0.3vw] md:border-[0.4vw] border-white rounded-full flex items-center justify-center">
                     <span className="text-[2.5vw] md:text-[3vw] leading-none mb-[0.2vw] md:mb-[0.5vw]">C</span>
                  </div>
               </div>
            </span>
          </h1>
        </motion.div>
        
        <div className="max-w-xs md:max-w-xl mt-8">
           <motion.p 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 0.6, y: 0 }}
             transition={{ delay: 0.8 }}
             className="text-[10px] md:text-xs uppercase kerning-wide font-medium leading-relaxed text-center"
           >
             We design and build digital experiences through strategy, branding, and technology.
           </motion.p>
        </div>
      </div>

    </section>
  );
}
