import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [cursorState, setCursorState] = useState<"default" | "hover" | "view-more">("default");

  const springConfig = { damping: 30, stiffness: 400, mass: 0.8 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorAttr = target.closest("[data-cursor]")?.getAttribute("data-cursor");

      if (cursorAttr === "view-more") {
        setCursorState("view-more");
        return;
      }

      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        setCursorState("hover");
      } else {
        setCursorState("default");
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX.set(e.touches[0].clientX);
        mouseY.set(e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        willChange: "transform, width, height, background-color"
      }}
      animate={{
        width: cursorState === "view-more" ? 100 : cursorState === "hover" ? 40 : 12,
        height: cursorState === "view-more" ? 100 : cursorState === "hover" ? 40 : 12,
        backgroundColor: cursorState === "view-more" ? "rgba(245, 245, 244, 1)" : cursorState === "hover" ? "rgba(245, 245, 244, 0.15)" : "rgba(245, 245, 244, 1)",
      }}
      className="fixed pointer-events-none z-[9999] rounded-full mix-blend-difference items-center justify-center overflow-hidden flex"
    >
      <AnimatePresence>
        {cursorState === "view-more" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-[10px] text-brand-bg uppercase font-bold tracking-widest whitespace-nowrap"
          >
            View More
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
