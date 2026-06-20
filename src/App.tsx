/**
 * Aura Labs - Master Configuration
 * Cinematic 3D Perspective + Vibrant Aura Sidebar + Routing
 */

import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Lenis from "lenis";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Layout Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkSection from "./components/WorkSection";
import ServicesSection from "./components/ServicesSection";
import SuccessSection from "./components/SuccessSection";
import PricingSection from "./components/PricingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import EvolutionSection from "./components/EvolutionSection";
import ContactFooter from "./components/ContactFooter";
import CustomCursor from "./components/CustomCursor";
import CursorTail from "./components/CursorTail";
import LogoTicker from "./components/LogoTicker";
import GiantTicker from "./components/GiantTicker";
import { ChatWidget } from "./components/ChatWidget";
import { Analytics } from "@vercel/analytics/react";

// Route-level code splitting: nothing below the landing page touches the
// first paint. Each of these only downloads when its route is visited, which
// keeps the eager bundle (and time-to-interactive on "/") as small as possible.
// Gate /studio out of production build to reduce bundle sizes
const SanityStudio = !import.meta.env.PROD
  ? lazy(() => import("./pages/SanityStudio"))
  : lazy(() => import("./pages/NotFound"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ContactPage = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const WebDevelopment = lazy(() => import("./pages/services/WebDevelopment"));
const AIChatbots = lazy(() => import("./pages/services/AIChatbots"));
const AIAds = lazy(() => import("./pages/services/AIAds"));
const BrandIdentity = lazy(() => import("./pages/services/BrandIdentity"));
const PrivacyPolicy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/Legal").then((m) => ({ default: m.TermsOfService })));


/**
 * UTILITY: SCROLL RESET & ANCHOR HANDLING
 * Ensures navigating to /#work or /work/:slug works perfectly.
 */
function ScrollHandler({ isMenuOpen }: { isMenuOpen: boolean }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // We wait for the menu to fully close before calculating scroll position,
    // otherwise the scaled-down canvas will report incorrect element coordinates.
    const delay = isMenuOpen ? 500 : 50; 
    
    const timeoutId = setTimeout(() => {
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return;
        }
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant"
        });
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [pathname, hash, isMenuOpen]);

  return null;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Once the homepage is painted and the browser goes idle, quietly warm the
  // chunks for the routes a visitor is most likely to open next. The homepage
  // still ships the smallest possible bundle (fast first paint), but by the
  // time someone taps a link the code is already cached — so navigation is
  // instant instead of showing the Suspense fallback. This is what removes the
  // "lazy feels slow" flash without bloating the initial load.
  useEffect(() => {
    const warm = () => {
      import("./pages/ProjectDetail");
      import("./pages/Contact");
      import("./pages/Checkout");
      import("./pages/services/WebDevelopment");
      import("./pages/services/AIChatbots");
      import("./pages/services/AIAds");
      import("./pages/services/BrandIdentity");
    };
    const ric =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel =
      (window as any).cancelIdleCallback || window.clearTimeout;
    const id = ric(warm, { timeout: 4000 });
    return () => cancel(id);
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    let lenis: Lenis | null = null;
    let rafId: number;

    // Only initialize Lenis smooth scrolling on desktop/pointer devices
    // This fixes the completely broken scrolling issue on touch devices
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5,
        infinite: false,
      });

      function raf(time: number) {
        if (!isMenuOpen && lenis) lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    // Prevent scrolling when the 3D menu is active
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      if (lenis) lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/#studio" },
    { name: "Work", href: "/#work" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <Router>
        <ScrollHandler isMenuOpen={isMenuOpen} />
        <SpeedInsights />
        <Analytics />
        <ChatWidget />
        
        {/* 1. PERSPECTIVE CONTAINER */}
        <div className="relative w-full min-h-screen bg-[#050505] overflow-hidden perspective-1000">
          
          {/* 2. VIBRANT SIDEBAR AURA (Background Layer) - Hidden on mobile for performance */}
          <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isMenuOpen ? 'opacity-100' : 'opacity-0'} hidden md:block`}>
            <m.div 
              animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] right-[-10%] w-full h-full bg-[#00F0FF]/10 rounded-full blur-[120px] will-change-transform" 
            />
            <m.div 
              animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 40, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] left-[-10%] w-full h-full bg-[#BD00FF]/10 rounded-full blur-[120px] will-change-transform" 
            />
          </div>

          {/* 3. SIDEBAR NAVIGATION CONTENT */}
          <div className="fixed inset-0 flex items-center justify-end z-0">
            <div className="w-[85%] md:w-[50%] pl-8 md:pl-24">
              <nav className="flex flex-col gap-1 md:gap-4">
                <AnimatePresence>
                  {isMenuOpen && navLinks.map((link, i) => (
                    <m.div
                      key={link.name}
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 50, opacity: 0 }}
                      transition={{ delay: 0.1 + (i * 0.05), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <MenuLink link={link} closeMenu={() => setIsMenuOpen(false)} />
                    </m.div>
                  ))}
                </AnimatePresence>
              </nav>
            </div>
          </div>

          {/* 4. CLOSE BUTTON (Attached to Canvas Edge) */}
          <AnimatePresence>
            {isMenuOpen && (
              <m.button
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
              </m.button>
            )}
          </AnimatePresence>
   
          {/* 5. MAIN CONTENT CANVAS (The 3D Element) */}
          <m.main 
            animate={{ 
              scale: isMenuOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0.94 : 0.85) : 1, 
              x: isMenuOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? "-75%" : "-40%") : "0%",
              rotateY: isMenuOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 10) : 0, 
              rotateX: isMenuOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 2) : 0, 
              borderRadius: isMenuOpen ? (typeof window !== 'undefined' && window.innerWidth < 768 ? "20px" : "40px") : "0px",
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left center" }}
            className="relative min-h-screen bg-black w-full z-10 shadow-[0_100px_200px_rgba(0,0,0,1)] overflow-hidden border border-white/5 will-change-transform"
          >
          {/* Interaction blocker - Click site to close menu */}
          {isMenuOpen && (
            <div 
              onClick={() => setIsMenuOpen(false)} 
              className="absolute inset-0 z-[200] cursor-pointer" 
            />
          )}

          <div className={`w-full transition-all duration-700 ${isMenuOpen ? 'md:brightness-[0.2] md:saturate-50 opacity-50 md:opacity-100' : ''}`}>
            <div className="hidden md:block">
              <CustomCursor />
              <CursorTail />
            </div>
            <Navbar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
              <Suspense fallback={<div className="h-screen w-full bg-black" />}>
              <Routes>
                {/* LANDING PAGE */}
                <Route path="/" element={
                  <div className="flex flex-col">
                    <Hero />
                    <LogoTicker />
                    <div id="work"><WorkSection /></div>
                    <GiantTicker />
                    <div id="studio"><ServicesSection /></div>
                    <TestimonialsSection />
                    <SuccessSection />
                    <div id="pricing"><PricingSection /></div>
                    <FAQSection />
                    <EvolutionSection />
                  </div>
                } />

                {/* DYNAMIC CASE STUDY PAGE */}
                <Route path="/work/:slug" element={<ProjectDetail />} />

                {/* SERVICE PAGES */}
                <Route path="/services/web-development" element={<WebDevelopment />} />
                <Route path="/services/ai-chatbots" element={<AIChatbots />} />
                <Route path="/services/ai-ads" element={<AIAds />} />
                <Route path="/services/brand-identity" element={<BrandIdentity />} />

                {/* REDIRECTS FOR SERVICES DIRECTORY */}
                <Route path="/services" element={<Navigate to="/" replace />} />
                <Route path="/services/" element={<Navigate to="/" replace />} />

                {/* ADMIN PAGE */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/studio/*" element={
                  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-[#00F0FF]">Loading Studio Interface...</div>}>
                    <SanityStudio />
                  </Suspense>
                } />

                {/* CONTACT PAGE */}
                <Route path="/contact" element={<ContactPage />} />

                {/* CHECKOUT PAGE */}
                <Route path="/checkout" element={<Checkout />} />

                {/* LEGAL PAGES */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* CATCH-ALL 404 ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>

            <div id="contact"><ContactFooter /></div>
            
            {/* NOISE OVERLAY - Hidden on mobile */}
            <div className="fixed inset-0 pointer-events-none z-[150] bg-noise opacity-[0.02] mix-blend-overlay hidden md:block" />
          </div>
        </m.main>
      </div>
    </Router>
    </LazyMotion>
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