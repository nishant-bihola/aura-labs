import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";

export default function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  
  // Custom vibrant color variable
  const vibrantColor = "#0055FF"; // Vibrant Electric Blue

  useEffect(() => {
    (async function () {
      // Initialize the Cal API
      const cal = await getCalApi({ namespace: "15min" });
      
      // Setting up the UI with your specific brand colors and namespace
      cal("init", "15min", { origin: "https://app.cal.com" });

      if (!("ns" in cal)) return;
      cal.ns["15min"]("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          light: { "cal-brand": vibrantColor },
          dark: { "cal-brand": vibrantColor }
        },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  const btnRef = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 150, damping: 15 });
  const springY = useSpring(my, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    mx.set(clientX - centerX);
    my.set(clientY - centerY);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <header className="absolute top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-8 flex items-center md:mix-blend-difference selection:bg-white/10">
      <motion.div 
        initial={{ opacity: 1, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base md:text-lg font-bold tracking-tighter"
      >
        <a href="/" className="no-underline text-white uppercase flex items-center gap-1 font-sans">
          Aura Labs <span className="font-light text-sm">©</span>
        </a>
      </motion.div>

      <div className="flex gap-3 md:gap-4 items-center ml-auto">
        {/* Cal.com Trigger Button */}
        <button 
          onClick={() => {
            window.location.href = '/contact#contact';
          }}
          className="group relative bg-white text-black px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] uppercase kerning-wide font-bold overflow-hidden h-8 md:h-9 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-[#0055FF] hover:text-white"
        >
          <div className="relative h-4 overflow-hidden pointer-events-none font-sans z-10">
            <div className="flex flex-col transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:-translate-y-1/2">
              <span className="h-4 flex items-center">LET'S TALK</span>
              <span className="h-4 flex items-center">GET STARTED</span>
            </div>
          </div>
        </button>
        
        <motion.button 
          ref={btnRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ x: springX, y: springY }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-colors duration-300"
        >
          <div className="flex flex-col gap-[3px] z-10 pointer-events-none">
            <motion.span 
              animate={isOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-4 h-[1.5px] bg-black rounded-full"
            />
            <motion.span 
              animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-[1.5px] bg-black rounded-full"
            />
            <motion.span 
              animate={isOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-4 h-[1.5px] bg-black rounded-full"
            />
          </div>
        </motion.button>
      </div>
    </header>
  );
}