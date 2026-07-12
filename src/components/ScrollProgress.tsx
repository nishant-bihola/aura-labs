import { motion, useScroll, useSpring } from "framer-motion";

/** Slim gradient progress bar pinned to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9997] h-[3px] origin-left bg-gradient-to-r from-[#00f0ff] via-[#7fdfff] to-[#bd00ff] shadow-[0_0_12px_rgba(0,240,255,0.5)]"
    />
  );
}
