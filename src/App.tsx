/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence } from "motion/react";
import { Instagram, Twitter, ArrowUpRight } from "lucide-react";
import CursorTail from "./components/CursorTail";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GiantTicker from "./components/GiantTicker";
import WorkSection from "./components/WorkSection";
import ServicesSection from "./components/ServicesSection";
import SuccessSection from "./components/SuccessSection";
import VideoShowreel from "./components/VideoShowreel";
import LogoTicker from "./components/LogoTicker";
import ContactFooter from "./components/ContactFooter";
import CustomCursor from "./components/CustomCursor";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      if (!isMenuOpen) {
        lenis.raf(time);
      }
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      lenis.destroy();
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Studio", href: "#studio" },
    { name: "Work", href: "#work" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#38536f] overflow-hidden">
      {/* Background Image Behind Everything */}
      <div 
        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
      />

      {/* Menu Overlay Container (Revealed when main is scaled down) */}
      <div className={`absolute top-0 right-0 bottom-0 w-[80%] md:w-[40%] flex flex-col justify-center pl-8 md:pl-24 transition-opacity duration-700 z-0 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col gap-2 relative">
          {/* Close button sticking onto the main container edge */}
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-1/2 -left-10 md:-left-20 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform z-50 cursor-pointer"
          >
            <div className="relative flex flex-col items-center justify-center">
              <div className="w-4 md:w-6 h-[2px] bg-black rotate-45 absolute" />
              <div className="w-4 md:w-6 h-[2px] bg-black -rotate-45 absolute" />
            </div>
          </button>

          <nav className="flex flex-col gap-2 md:gap-4 items-start text-left mt-8 w-full">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-5xl md:text-6xl lg:text-[5vw] font-display text-white uppercase tracking-tighter leading-[0.9] transition-all duration-300 transform w-full hover:translate-x-4 hover:text-white/80"
              >
                {link.name}
              </a>
            ))}
          </nav>
          
          <div className="flex gap-4 mt-8 pt-8 border-t border-white/20 w-[60%]">
            <a href="#" className="opacity-80 hover:opacity-100 transition-all text-white"><Instagram size={20} /></a>
            <a href="#" className="opacity-80 hover:opacity-100 transition-all text-white"><Twitter size={20} /></a>
            <a href="#" className="opacity-80 hover:opacity-100 transition-all text-white"><ArrowUpRight size={20} /></a>
          </div>
        </div>
      </div>

      {/* Main Extracted View */}
      <motion.main 
        animate={{ 
          scale: isMenuOpen ? (window.innerWidth < 768 ? 0.9 : 0.95) : 1, 
          x: isMenuOpen ? (window.innerWidth < 768 ? "-75%" : "-35%") : "0%",
          boxShadow: isMenuOpen ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "none"
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${isMenuOpen ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden pt-px"} bg-brand-bg w-full origin-left z-10 transition-colors`}
      >
        <div className={`w-full h-full ${isMenuOpen ? 'pointer-events-none' : ''}`}>
          <CustomCursor />
          <CursorTail />
          <Navbar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
          <Hero />
          <GiantTicker />
          <WorkSection />
          <ServicesSection />
          <SuccessSection />
          <VideoShowreel />
          <LogoTicker />
          <ContactFooter />
          
          {/* Noise Overlay */}
          <div className="fixed inset-0 pointer-events-none z-[100] bg-noise mix-blend-overlay opacity-[0.03]" />
        </div>
      </motion.main>
    </div>
  );
}
