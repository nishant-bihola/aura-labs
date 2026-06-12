import { motion } from "motion/react";

export default function GiantTicker() {
  return (
    <div className="py-8 md:py-12 border-y border-white/5 overflow-hidden mx-3 md:mx-6">
      <motion.div 
        animate={{ x: [0, -2000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-24 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[18vw] md:text-[12vw] font-black uppercase serif italic opacity-5 leading-none">
            Aura Labs — Web Development — AI Chatbots — Edmonton — AI Content —
          </span>
        ))}
      </motion.div>
    </div>
  );
}
