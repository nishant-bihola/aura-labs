"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowUpRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const PLANS = [
  {
    name: "Starter",
    tagline: "Built for early-stage teams",
    description: "Built for early-stage teams establishing their online presence.",
    price: "$2,000",
    period: "/project",
    features: [
      "Tailored website layouts",
      "Core SEO configuration",
      "Mobile-first responsive design",
      "Brand-ready UI framework",
      "Ideal for new launches and rebrands"
    ],
    highlight: false
  },
  {
    name: "Growth",
    tagline: "Designed for businesses",
    description: "Designed for businesses ready to elevate their digital experience.",
    price: "$4,000",
    period: "/project",
    features: [
      "High-end design with smooth interactions",
      "Complete on-site SEO setup",
      "Adaptive layouts for every screen",
      "CMS setup for content or case studies",
      "Performance tuning & optimization"
    ],
    highlight: true
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
          stagger: 0.05,
          duration: 0.5,
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
    // Explicitly scroll to top before navigation for immediate feedback
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(`/contact?plan=${encodeURIComponent(planName)}`);
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
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
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
          
          <h2 className="pricing-title-reveal fluid-h2 font-valtero-serif leading-[1.1] pb-4 tracking-tight relative inline-block">
            <span className="text-outline opacity-20 italic font-valtero-serif">Pricing ©26</span>
            <div className="pricing-title-fill absolute top-0 left-0 overflow-hidden whitespace-nowrap text-white italic font-valtero-serif">
              Pricing ©26
            </div>
          </h2>
          
          <div className="mt-6 md:mt-8 max-w-lg">
            <p className="pricing-title-reveal text-sm md:text-xl text-white/50 font-sans leading-relaxed">
              From launch-ready basics to high-performance <br className="hidden md:block" /> 
              cinematic driven experiences.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div ref={cardsRef} className="pricing-grid max-w-5xl">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={`pricing-card group relative p-6 md:p-10 lg:p-12 rounded-[24px] md:rounded-[40px] border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                plan.highlight 
                ? "bg-white/[0.03] border-white/20 shadow-2xl shadow-white/[0.01]" 
                : "bg-transparent border-white/5 hover:border-white/20"
              }`}
            >
              {/* Refined Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 md:mb-12">
                  <div>
                    <h3 className="text-xl md:text-4xl font-serif mb-1 group-hover:italic transition-all duration-400">{plan.name}</h3>
                    <p className="text-[7px] md:text-[10px] tracking-[0.2em] uppercase text-white/30 font-sans">{plan.tagline}</p>
                  </div>
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-400">
                    <ArrowUpRight size={14} md:size={18} />
                  </div>
                </div>

                <div className="mb-6 md:mb-12">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-5xl lg:text-6xl font-serif tracking-tighter">{plan.price}</span>
                    <span className="text-white/20 text-[9px] md:text-sm font-sans">{plan.period}</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 mb-6 md:mb-12" />

                <ul className="space-y-3 md:space-y-6 mb-10 md:mb-16">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 md:gap-4 text-white/50 group-hover:text-white/80 transition-colors duration-200">
                      <div className="w-3 h-3 md:w-4 md:h-4 mt-0.5 md:mt-1 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Check size={6} md:size={8} className="text-white/40" />
                      </div>
                      <span className="text-[10px] md:text-sm font-sans leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10">
                <button 
                  onClick={() => handleGetStarted(plan.name)}
                  className="relative w-full py-4 md:py-5 rounded-full overflow-hidden group/btn transition-all duration-400 bg-white/5 border border-white/10 hover:border-white/40"
                >
                  <div className="absolute inset-0 bg-white translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                  <span className="relative z-10 text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-bold group-hover/btn:text-black transition-colors duration-400">
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
            Limited spots available for Q1 2026
          </p>
          <Link to="/contact" className="group flex items-center gap-3 md:gap-4 text-white/50 hover:text-white transition-colors duration-500">
            <span className="text-base md:text-lg font-valtero-serif italic">Need a custom enterprise solution?</span>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:rotate-45 group-hover:border-white transition-all duration-500">
              <ArrowUpRight size={12} md:size={14} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}