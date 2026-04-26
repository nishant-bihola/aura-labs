"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
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
      
      cal.ns["15min"]("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          light: { "cal-brand": vibrantColor }, // Updated: Cal UI now uses vibrant color
          dark: { "cal-brand": vibrantColor }  // Updated: Cal UI now uses vibrant color
        },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-[100] px-12 py-8 flex items-center mix-blend-difference selection:bg-white/10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold tracking-tighter absolute left-12 md:left-12"
        >
          <a href="/" className="no-underline text-white uppercase flex items-center gap-1 font-valtero-sans">
            Aura Labs <span className="font-light text-sm">©</span>
          </a>
        </motion.div>

        <div className="flex gap-4 items-center absolute right-12">
          {/* Cal.com Trigger Button */}
          <button 
            data-cal-namespace="15min"
            data-cal-link="nishant-bihola-aura-lab/15min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
            // Added vibrant hover bg and transition
            className="group relative bg-white text-black px-6 py-2 rounded-full text-[11px] uppercase kerning-wide font-bold overflow-hidden h-9 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-[#0055FF] hover:text-white"
          >
            <div className="relative h-4 overflow-hidden pointer-events-none font-valtero-sans z-10">
              <div className="flex flex-col transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:-translate-y-1/2">
                <span className="h-4 flex items-center">LET'S TALK</span>
                <span className="h-4 flex items-center">BOOK A CALL</span>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-5 h-5 bg-white rounded-full hidden md:block hover:scale-110 transition-transform cursor-pointer"
          />
        </div>
      </header>
    </>
  );
}