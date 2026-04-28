import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isExit, setIsExit] = useState(false);

  useEffect(() => {
    // Total duration 4.5 seconds
    const duration = 4500;
    const intervalTime = 45; // roughly 100 steps
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExit(true);
            setTimeout(onComplete, 1000); // Wait for exit animation
          }, 500);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Main Logo / Text */}
          <div className="relative overflow-hidden">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl font-valtero-serif italic text-white tracking-tighter"
            >
              AURA LABS
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="h-px bg-white/20 mt-4"
            />
          </div>

          {/* Progress Counter */}
          <div className="absolute bottom-12 md:bottom-20 left-12 md:left-20 overflow-hidden">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-baseline gap-2"
            >
              <span className="text-4xl md:text-8xl font-black text-white/10 leading-none">
                {Math.round(progress).toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 mb-2 md:mb-4">
                Architecture in progress
              </span>
            </motion.div>
          </div>

          {/* Side Info */}
          <div className="absolute top-12 md:top-20 right-12 md:right-20 hidden md:block">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
               © 2026 NISHANT BIHOLA<br />
               EST. 2024
             </p>
          </div>

          {/* Aesthetic Blur Element */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[150px] pointer-events-none z-[-1]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
