/**
 * Aura Labs - Master Configuration
 * Cinematic 3D Perspective + Vibrant Aura Sidebar + Routing
 */

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Layout Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkSection from "./components/WorkSection";
import ServicesSection from "./components/ServicesSection";
import SuccessSection from "./components/SuccessSection";
import PricingSection from "./components/PricingSection";
import TestimonialSection from "./components/TestimonialSection";
import ContactFooter from "./components/ContactFooter";
import CustomCursor from "./components/CustomCursor";
import CursorTail from "./components/CursorTail";

// Pages
import ProjectDetail from "./pages/ProjectDetail";
import ContactPage from "./pages/Contact";

/**
 * UTILITY: SCROLL RESET & ANCHOR HANDLING
 * Ensures navigating to /#work or /work/:slug works perfectly.
 */
function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to the element
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    
    // Otherwise, always reset to top on pathname change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant to avoid conflict with Lenis smooth scroll
    });
    
    // Force a secondary reset for extra reliability (common fix for Lenis/Router conflicts)
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize Smooth Scroll (Lenis)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      if (!isMenuOpen) lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Prevent scrolling when the 3D menu is active
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => lenis.destroy();
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/#studio" },
    { name: "Work", href: "/#work" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <Router>
      <ScrollHandler />
      
      {/* 1. PERSPECTIVE CONTAINER */}
      <div className="relative w-full min-h-screen bg-[#050505] overflow-hidden perspective-1000">
        
        {/* 2. VIBRANT SIDEBAR AURA (Background Layer) */}
        <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-10%] w-full h-full bg-[#00F0FF]/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-10%] w-full h-full bg-[#BD00FF]/10 rounded-full blur-[120px]" 
          />
        </div>

        {/* 3. SIDEBAR NAVIGATION CONTENT */}
        <div className="fixed inset-0 flex items-center justify-end z-0">
          <div className="w-[85%] md:w-[50%] pl-8 md:pl-24">
            <nav className="flex flex-col gap-1 md:gap-4">
              <AnimatePresence>
                {isMenuOpen && navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MenuLink link={link} closeMenu={() => setIsMenuOpen(false)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </nav>
          </div>
        </div>

        {/* 4. CLOSE BUTTON (Attached to Canvas Edge) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 90 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed top-1/2 left-[5%] md:left-[45%] -translate-y-1/2 z-[200] w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-black cursor-pointer shadow-2xl hover:scale-110 transition-transform duration-500"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-6 md:w-8 h-[2px] bg-black rotate-45" />
                <div className="absolute w-6 md:w-8 h-[2px] bg-black -rotate-45" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 5. MAIN CONTENT CANVAS (The 3D Element) */}
        <motion.main 
          animate={{ 
            scale: isMenuOpen ? 0.85 : 1, 
            x: isMenuOpen ? (window.innerWidth < 768 ? "-85%" : "-40%") : "0%",
            rotateY: isMenuOpen ? 10 : 0, // Cinematic Valtero 3D Tilt
            rotateX: isMenuOpen ? 2 : 0, 
            borderRadius: isMenuOpen ? "40px" : "0px",
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left center" }}
          className="relative min-h-screen bg-black w-full z-10 shadow-[0_100px_200px_rgba(0,0,0,1)] overflow-hidden border border-white/5"
        >
          {/* Interaction blocker - Click site to close menu */}
          {isMenuOpen && (
            <div 
              onClick={() => setIsMenuOpen(false)} 
              className="absolute inset-0 z-[200] cursor-pointer" 
            />
          )}

          <div className={`w-full transition-all duration-1000 ${isMenuOpen ? 'brightness-[0.2] saturate-50' : ''}`}>
            <CustomCursor />
            <CursorTail />
            <Navbar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            
            <Routes>
              {/* LANDING PAGE */}
              <Route path="/" element={
                <div className="flex flex-col">
                  <Hero />
                  <div id="work"><WorkSection /></div>
                  <div id="studio"><ServicesSection /></div>
                  <SuccessSection />
                  <div id="pricing"><PricingSection /></div>
                  <TestimonialSection />
                </div>
              } />

              {/* DYNAMIC CASE STUDY PAGE */}
              <Route path="/work/:slug" element={<ProjectDetail />} />

              {/* CONTACT PAGE */}
              <Route path="/contact" element={<ContactPage />} />
            </Routes>

            <div id="contact"><ContactFooter /></div>
            
            {/* NOISE OVERLAY */}
            <div className="fixed inset-0 pointer-events-none z-[150] bg-noise opacity-[0.02] mix-blend-overlay" />
          </div>
        </motion.main>
      </div>
    </Router>
  );
}

/**
 * MENU LINK COMPONENT
 * Handles Redirects, Active States (Cyan), and Hover Effects (Violet Arrow)
 */
function MenuLink({ link, closeMenu }: { link: any, closeMenu: () => void }) {
  const location = useLocation();
  
  // Logic to determine if the link is active (Path or Hash match)
  const isActive = 
    (link.href === "/" && location.pathname === "/" && !location.hash) ||
    (link.href.startsWith("/#") && location.hash === link.href.replace("/", ""));

  return (
    <Link
      to={link.href}
      onClick={closeMenu}
      className={`group flex items-center gap-6 transition-all duration-500 ${
        isActive ? 'text-[#00F0FF]' : 'text-white/40 hover:text-white'
      }`}
    >
      <span className="text-5xl md:text-8xl lg:text-[7.5vw] font-black uppercase tracking-tighter leading-[0.8] group-hover:translate-x-8 transition-transform duration-700 group-hover:italic">
        {link.name}
      </span>
      
      {/* Dynamic Arrow from image_2d9778.png */}
      <ArrowUpRight 
        className={`transition-all duration-700 ${
          isActive 
            ? 'opacity-100 text-[#00F0FF] translate-x-0' 
            : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-2 text-[#BD00FF]'
        }`} 
        size={60} 
        strokeWidth={3}
      />
    </Link>
  );
}