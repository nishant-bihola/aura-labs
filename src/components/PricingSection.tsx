"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowUpRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { track } from "@vercel/analytics";

gsap.registerPlugin(ScrollTrigger);

const PLANS = [
  {
    name: "Starter",
    tagline: "Marketing site, fast",
    description: "A clean, conversion-focused website for businesses launching or rebranding online.",
    price: "$1,500",
    period: "/project",
    features: [
      "Custom React website (up to 5 pages)",
      "Mobile-first responsive design",
      "Core SEO and meta setup",
      "Contact form and lead capture",
      "Rapid deployment and seamless integration"
    ],
    highlight: false
  },
  {
    name: "Growth",
    tagline: "Comprehensive web applications",
    description: "A complete web application with advanced integration capabilities to scale your business.",
    price: "$4,500",
    period: "/project",
    features: [
      "Full-stack web app (React + Node.js)",
      "AI chatbot for bookings, FAQs, or leads",
      "User auth, database & admin dashboard",
      "E-commerce or ordering system",
      "Performance tuning & SEO optimization"
    ],
    highlight: true
  },
  {
    name: "AI Content",
    tagline: "Targeted campaigns",
    description: "High-quality ad creatives and product imagery delivered rapidly.",
    price: "$800",
    period: "/campaign",
    features: [
      "3 × 15-second motion ad videos",
      "5 × product/hero images",
      "Script and storyboard included",
      "Delivered within 24 to 48 hours",
      "Ready to publish on any platform"
    ],
    highlight: false
  },
  {
    name: "Maintenance",
    tagline: "Worry-free operation",
    description: "Keep your website secure, fast, and up-to-date with our monthly retainer.",
    price: "$150",
    period: "/month",
    features: [
      "99.9% Uptime Guarantee",
      "Daily Backups & Security Scans",
      "Content Updates (up to 2 hrs)",
      "Premium Plugin Licenses",
      "Priority Email Support"
    ],
    highlight: false
  },
  {
    name: "AI Chatbot SaaS",
    tagline: "Always-on intelligence",
    description: "Fully managed AI chatbot hosting, fine-tuning, and performance monitoring.",
    price: "$99",
    period: "/month",
    features: [
      "Unlimited Monthly Chats (Super responsive)",
      "Monthly Knowledge Base Updates",
      "Lead Capture Integration",
      "Performance Analytics",
      "Dedicated Account Manager"
    ],
    highlight: false
  }
];

export default function AuraPricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title Reveal Animation
      gsap.fromTo(
        ".pricing-title-fill",
        { width: "0%" },
        {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 20%",
            scrub: 0.5,
          }
        }
      );

      gsap.fromTo(
        ".pricing-title-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          }
        }
      );

      // Cards Staggered Entrance
      gsap.fromTo(
        ".pricing-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.03,
          duration: 0.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = (planName: string) => {
    try {
      track("Pricing CTA Clicked", { plan: planName });
    } catch (err) {
      console.warn("Analytics tracking failed:", err);
    }
    // Explicitly scroll to top before navigation for immediate feedback
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(`/checkout?plan=${encodeURIComponent(planName)}`);
  };

  return (
    <section 
      ref={sectionRef}
      className="fluid-py fluid-px bg-[#050505] text-white overflow-hidden relative border-x border-white/5 mx-3 md:mx-6"
      id="pricing"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        .font-valtero-serif { font-family: 'Times New Roman', serif; }
        .font-valtero-sans { font-family: 'Inter', sans-serif; }
        .text-outline {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .pricing-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .pricing-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-12 md:mb-32">
          <div className="flex items-center gap-2 mb-4 md:mb-6 opacity-60">
            <span className="w-8 h-[1px] bg-white"></span>
            <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-valtero-sans">Investment</p>
          </div>
          
          <h2 className="pricing-title-reveal fluid-h2 font-valtero-serif leading-[1.2] pb-6 tracking-tight relative inline-block">
            <span className="text-outline opacity-20 italic font-valtero-serif">Pricing ©26</span>
            <div className="pricing-title-fill absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap text-white italic font-valtero-serif">
              Pricing ©26
            </div>
          </h2>
          
          <div className="mt-6 md:mt-8 max-w-lg">
            <p className="pricing-title-reveal text-sm md:text-xl text-white/50 font-sans leading-relaxed">
              Discover our range of products designed to optimize operations <br className="hidden md:block" /> 
              and enhance your digital presence.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div ref={cardsRef} className="pricing-grid max-w-7xl">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={`pricing-card group relative p-6 sm:p-8 lg:p-10 rounded-[24px] md:rounded-[40px] border transition-all duration-500 flex flex-col justify-between overflow-hidden ${
                plan.highlight 
                ? "bg-[#050505] border-[#00f0ff]/50 shadow-[0_0_50px_rgba(0,240,255,0.15)] scale-[1.02]" 
                : "bg-transparent border-white/5 hover:border-white/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 to-transparent pointer-events-none" />
              )}
              {/* Refined Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 md:mb-12 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl md:text-3xl font-serif mb-1 group-hover:italic transition-all duration-400 leading-tight">{plan.name}</h3>
                    <p className="text-[9px] md:text-[12px] tracking-[0.2em] uppercase text-white/50 font-sans mt-2">{plan.tagline}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-400">
                    <ArrowUpRight size={14} className="md:w-[18px] md:h-[18px]" />
                  </div>
                </div>

                <div className="mb-6 md:mb-12">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tighter whitespace-nowrap">{plan.price}</span>
                    <span className="text-white/40 text-[11px] md:text-sm font-sans whitespace-nowrap">{plan.period}</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 mb-6 md:mb-12" />

                <ul className="space-y-3 md:space-y-6 mb-10 md:mb-16">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 md:gap-4 text-white/70 group-hover:text-white transition-colors duration-200">
                      <div className="w-3 h-3 md:w-4 md:h-4 mt-0.5 md:mt-1 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shrink-0">
                        <Check size={6} className="md:w-2 md:h-2 text-white/60" />
                      </div>
                      <span className="text-[12px] md:text-sm font-sans leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10">
                <button 
                  onClick={() => handleGetStarted(plan.name)}
                  className={`relative w-full py-4 md:py-5 rounded-full overflow-hidden group/btn transition-all duration-500 border focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none ${
                    plan.highlight 
                    ? "bg-gradient-to-r from-[#00f0ff] to-[#0055ff] border-transparent text-black" 
                    : "bg-white/5 border-white/10 hover:border-white/40 text-white"
                  }`}
                >
                  <div className={`absolute inset-0 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] ${
                    plan.highlight ? "bg-white" : "bg-white"
                  }`} />
                  <span className={`relative z-10 text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-bold transition-colors duration-500 ${
                    plan.highlight ? "group-hover/btn:text-black" : "group-hover/btn:text-black"
                  }`}>
                    Get Started
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Footer Link (Valtero Style) */}
        <div className="mt-20 md:mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-white/20 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-valtero-sans">
            All prices in CAD · Based in Edmonton · Serving clients worldwide
          </p>
          <Link to="/estimate" className="group flex items-center gap-3 md:gap-4 text-white/50 hover:text-white transition-colors duration-500">
            <span className="text-base md:text-lg font-valtero-serif italic">Get an instant AI estimate</span>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:rotate-45 group-hover:border-white transition-all duration-500">
              <ArrowUpRight size={12} className="md:w-3.5 md:h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}