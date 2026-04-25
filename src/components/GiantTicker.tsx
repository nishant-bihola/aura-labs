import { motion } from "motion/react";

export default function GiantTicker() {
  return (
    <div className="py-12 border-y border-border-soft overflow-hidden mx-6">
      <motion.div 
        animate={{ x: [0, -2000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-24 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[20vw] md:text-[12vw] font-black uppercase serif italic opacity-5 leading-none">
            Aura Labs — Digital Residency — Studio — Berlin —
          </span>
        ))}
      </motion.div>
    </div>
  );
}
