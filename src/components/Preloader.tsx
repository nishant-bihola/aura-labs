import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isExit, setIsExit] = useState(false);

  useEffect(() => {
    // Total duration 3 seconds
    const duration = 3000;
    const intervalTime = 30; // 100 steps
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExit(true);
            setTimeout(onComplete, 800);
          }, 400);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const letterVariants = {
    initial: { rotateY: 90, opacity: 0, z: -100 },
    animate: { rotateY: 0, opacity: 1, z: 0 },
  };

  return (
    <AnimatePresence>
      {!isExit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden perspective-[1000px]"
        >
          {/* Dynamic Vibrant Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              background: [
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,1) 70%)",
                "radial-gradient(circle, rgba(100,100,255,0.15) 0%, rgba(0,0,0,1) 70%)",
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,1) 70%)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-[-1]"
          />

          {/* 3D Rotating Typography */}
          <div className="flex gap-[0.1em] overflow-hidden">
            {"AURA LABS".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                initial="initial"
                animate="animate"
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.05, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className={`text-4xl md:text-7xl font-valtero-serif italic text-white tracking-tighter inline-block ${char === " " ? "w-4 md:w-8" : ""}`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 flex flex-col items-center gap-4">
             <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                />
             </div>
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/40 flex items-center gap-4"
             >
               <span>Loading Experience</span>
               <span className="text-white tabular-nums">{Math.round(progress)}%</span>
             </motion.div>
          </div>

          {/* 3D Decor Element */}
          <motion.div 
            animate={{ 
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 z-[-1] rounded-full"
            style={{ transformStyle: "preserve-3d" }}
          />

          {/* Copyright Info */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0">
             <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/20 text-center md:text-right leading-relaxed">
               Crafting Excellence<br />
               © 2026 AURA LABS
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
