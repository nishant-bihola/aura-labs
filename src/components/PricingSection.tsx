"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        ".pricing-title-reveal",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          }
        }
      );

      // Cards Staggered Entrance
      gsap.fromTo(
        ".pricing-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="fluid-py fluid-px bg-[#050505] text-white overflow-hidden"
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
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-20 md:mb-32">
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <span className="w-8 h-[1px] bg-white"></span>
            <p className="text-[10px] tracking-[0.3em] uppercase font-valtero-sans">Investment</p>
          </div>
          
          <h2 className="pricing-title-reveal fluid-h2 font-valtero-serif leading-[0.85] tracking-tight">
            Pricing <span className="text-outline italic font-valtero-serif opacity-80">©26</span>
          </h2>
          
          <div className="mt-8 max-w-lg">
            <p className="pricing-title-reveal text-lg md:text-xl text-white/50 font-valtero-sans leading-relaxed">
              From launch-ready basics to high-performance <br className="hidden md:block" /> 
              cinematic driven experiences.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 fluid-gap">
          {PLANS.map((plan, i) => (
            <div 
              key={plan.name}
              className={`pricing-card group relative p-8 md:p-16 rounded-[40px] border transition-all duration-700 ${
                plan.highlight 
                ? "bg-white/5 border-white/20" 
                : "bg-transparent border-white/10 hover:border-white/30"
              }`}
            >
              {/* Interactive Hover Glow */}
              <div className="absolute inset-0 bg-radial-at-t from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-4xl font-valtero-serif mb-2">{plan.name}</h3>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-valtero-sans">{plan.tagline}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl md:text-7xl font-valtero-serif tracking-tighter">{plan.price}</span>
                    <span className="text-white/30 text-sm font-valtero-sans">{plan.period}</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/10 mb-12" />

                <ul className="space-y-6 mb-16">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors duration-300">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Check size={10} className="text-white/50" />
                      </div>
                      <span className="text-sm md:text-base font-valtero-sans">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/contact')}
                  className="relative w-full py-6 rounded-full overflow-hidden group/btn transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-white translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-expo" />
                  <div className={`absolute inset-0 border border-white/20 rounded-full ${plan.highlight ? 'bg-white/10' : 'bg-white/5'}`} />
                  <span className="relative z-10 text-[11px] tracking-[0.3em] uppercase font-bold group-hover/btn:text-black transition-colors duration-500">
                    Get Started
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Footer Link (Valtero Style) */}
        <div className="mt-24 md:mt-40 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-valtero-sans">
            Limited spots available for Q1 2026
          </p>
          <a href="/contact" className="group flex items-center gap-4 text-white/80 hover:text-white transition-colors">
            <span className="text-lg font-valtero-serif italic">Need a custom enterprise solution?</span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
              <ArrowUpRight size={14} />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};