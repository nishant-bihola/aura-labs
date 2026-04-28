"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    question: "What sets Aura Labs apart from other agencies?",
    answer: "We operate as a boutique high-performance studio, not a volume-based shop. We focus on the intersection of technical precision and cinematic design, ensuring every project is a unique digital asset designed to dominate its niche."
  },
  {
    question: "What is the investment for a bespoke digital ecosystem?",
    answer: "Our projects typically range from $2,000 to $10,000+, depending on the complexity of the motion systems and strategic depth. We provide transparent, value-based pricing that reflects the elite quality of our output."
  },
  {
    question: "How long is the strategic discovery and design phase?",
    answer: "A typical engagement spans 4 to 8 weeks. This allows for rigorous strategic alignment, custom design iterations, and precision development. We prioritize architectural excellence over rushed delivery."
  },
  {
    question: "Do you provide ongoing technical support and optimization?",
    answer: "Yes. We offer elite post-launch partnerships that include performance monitoring, SEO scaling, and continuous UI/UX refinement to ensure your brand remains at the forefront of the digital landscape."
  },
  {
    question: "How do we begin a partnership with Aura Labs?",
    answer: "The process begins with a strategic consultation. We assess your brand's objectives and technical requirements to ensure a mutual fit. From there, we move into a deep discovery phase to architect your digital future."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title Reveal Animation (matching Pricing style)
      gsap.fromTo(
        ".faq-title-fill",
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
        ".faq-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="fluid-py fluid-px bg-[#050505] text-white overflow-hidden relative border-x border-white/5 mx-3 md:mx-6"
      id="faq"
    >
      <style>{`
        .font-valtero-serif { font-family: 'Times New Roman', serif; }
        .font-valtero-sans { font-family: 'Inter', sans-serif; }
        .text-outline {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-32">
          
          {/* LEFT: HEADER CONTENT */}
          <div className="lg:w-[40%] flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4 md:mb-6 opacity-60">
              <span className="w-8 h-[1px] bg-white"></span>
              <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-valtero-sans">Inquiries</p>
            </div>
            
            <h2 className="faq-reveal fluid-h2 font-valtero-serif leading-[0.85] tracking-tight relative inline-block mb-10 md:mb-16">
              <span className="text-outline opacity-20 italic font-valtero-serif">FAQS ©26</span>
              <div className="faq-title-fill absolute top-0 left-0 overflow-hidden whitespace-nowrap text-white italic font-valtero-serif">
                FAQS ©26
              </div>
            </h2>
            
            <p className="faq-reveal text-sm md:text-xl text-white/50 font-valtero-sans leading-relaxed mb-10 md:mb-12 max-w-sm">
              Exploring the architecture of our process and the strategic foundation of our digital studio.
            </p>
            
            <div className="faq-reveal">
              <Link 
                to="/contact" 
                className="group relative inline-flex items-center gap-4 py-4 px-8 rounded-full bg-white/5 border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/40"
              >
                <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                <span className="relative z-10 text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-bold text-white group-hover:text-black transition-colors duration-400">
                  Submit an Inquiry
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT: MINIMALIST ACCORDION LIST */}
          <div className="lg:w-[60%] flex flex-col border-t border-white/5">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="group border-b border-white/5"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full text-left py-6 md:py-12 flex items-center justify-between gap-6 md:gap-8 focus:outline-none"
                >
                  <h3 className={`text-base md:text-2xl font-valtero-serif transition-all duration-500 pr-4 ${
                    openIndex === idx ? 'text-white italic' : 'text-white/40 group-hover:text-white group-hover:italic'
                  }`}>
                    {faq.question}
                  </h3>
                  
                  {/* CUSTOM ANIMATED ICON */}
                  <div className="relative w-3.5 h-3.5 md:w-6 md:h-6 flex items-center justify-center shrink-0">
                    <div className="absolute w-full h-[1px] bg-white/40 group-hover:bg-white transition-colors duration-300" />
                    <div className={`absolute w-[1px] h-full bg-white/40 group-hover:bg-white transition-all duration-500 ease-[0.16,1,0.3,1] ${
                      openIndex === idx ? 'rotate-90 scale-y-0' : 'rotate-0'
                    }`} />
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="pb-8 md:pb-12 pr-4 md:pr-12">
                        <p className="text-white/50 text-sm md:text-lg font-valtero-sans leading-relaxed max-w-2xl">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
