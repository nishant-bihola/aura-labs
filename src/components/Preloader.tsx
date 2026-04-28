import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const letterVariants = {
    initial: { rotateY: 90, opacity: 0, y: 20 },
    animate: (i: number) => ({
      rotateY: 0,
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        delay: i * 0.05, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }),
    exit: { 
      rotateX: -90, 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        y: "-100%",
        transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* 3D Atmospheric Depth */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          background: [
            "radial-gradient(circle at 20% 30%, rgba(0, 85, 255, 0.15), transparent 70%)",
            "radial-gradient(circle at 80% 70%, rgba(189, 0, 255, 0.15), transparent 70%)",
            "radial-gradient(circle at 20% 30%, rgba(0, 85, 255, 0.15), transparent 70%)"
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Scanning Light Effect */}
      <motion.div 
        animate={{ top: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent pointer-events-none skew-y-12"
      />

      {/* Main Content with Perspective */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex gap-[0.05em] mb-4" style={{ transformStyle: "preserve-3d" }}>
          {"AURA LABS".split("").map((char, i) => (
            <motion.div
              key={`pre-char-${i}`}
              custom={i}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              className="relative inline-block"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className={`text-4xl md:text-8xl font-valtero-serif italic text-white tracking-tighter inline-block ${char === " " ? "w-4 md:w-8" : ""}`}>
                {char}
              </span>
              {/* Ghost Layer for Glitch Effect */}
              <motion.span
                animate={{ 
                  x: [0, -2, 2, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                className={`absolute top-0 left-0 text-4xl md:text-8xl font-valtero-serif italic text-[#00F0FF] tracking-tighter inline-block pointer-events-none ${char === " " ? "w-4 md:w-8" : ""}`}
              >
                {char}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Progress System */}
        <div className="mt-8 flex flex-col items-center gap-4 w-64">
           <div className="w-full h-[2px] bg-white/5 relative overflow-hidden rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0055FF] via-white to-[#BD00FF] shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              />
           </div>
           
           <div className="flex justify-between w-full px-1">
             <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-[#00F0FF]"
                />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/40">
                  Architecting
                </span>
             </div>
             <span className="text-[11px] font-medium text-white tabular-nums opacity-80">
               {Math.round(progress).toString().padStart(2, '0')}%
             </span>
           </div>
        </div>
      </div>

      {/* 3D Decorative Rings with improved perspective */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          animate={{ 
            rotateX: [60, 60],
            rotateZ: [0, 360 * (ring % 2 === 0 ? 1 : -1)],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 15 + ring * 5, repeat: Infinity, ease: "linear" }}
          className="absolute border border-white/20 rounded-full pointer-events-none"
          style={{ 
            width: `${ring * 300}px`, 
            height: `${ring * 300}px`,
            transformStyle: "preserve-3d"
          }}
        />
      ))}

      {/* Status Bar */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end overflow-hidden">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-1"
        >
          <div className="w-8 h-[1px] bg-[#00F0FF]/40" />
          <p className="text-[8px] uppercase tracking-[0.5em] text-white/20">System Phase v.01</p>
        </motion.div>
        
        <motion.p 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[8px] uppercase tracking-[0.5em] text-white/20 text-right"
        >
          Aura Labs<br />Digital Core ©2026
        </motion.p>
      </div>
    </motion.div>
  );
}
