"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  { 
    text: "Aura Lab brought clarity to a very complex project. Their ability to translate ideas into a clean digital system was exceptional.", 
    name: "Laura Bianchi", 
    company: "Square", 
    col: 0, 
    bg: "#121212",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" 
  },
  { 
    text: "Working with Aura Lab felt like having an internal team rather than an external agency.", 
    name: "Daniel Morgan", 
    company: "Acme", 
    col: 1, 
    bg: "#181818",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  { 
    text: "We didn't just get a website — we got a solid digital foundation. Aura Lab is the kind of partner you want.", 
    name: "Michael Turner", 
    company: "Radius", 
    col: 2, 
    bg: "#161616",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  { 
    text: "The final product wasn't just beautiful — it performed. Aura Lab helped us build a system we can scale.", 
    name: "James Whitaker", 
    company: "Alt+Shift", 
    col: 0, 
    bg: "#181818",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  { 
    text: "What stood out was the balance between design quality and technical execution.", 
    name: "Sophia Klein", 
    company: "Nebula", 
    col: 1, 
    bg: "#121212",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  { 
    text: "Their ability to listen and challenge assumptions made a real difference for our brand.", 
    name: "Elena Rossi", 
    company: "FR", 
    col: 2, 
    bg: "#181818",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
];

export default function PinnedStaircaseTestimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
        ScrollTrigger.refresh();
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          // End exactly when the last card animation finishes
          end: "+=3500", 
          scrub: 1,
          pin: true,
          pinSpacing: true, // This adds the necessary height to the parent to allow for the pin
          anticipatePin: 1,
          invalidateOnRefresh: true
        },
      });

      // 1. ORIGINAL TEXT ANIMATION
      const chars = textRef.current?.querySelectorAll(".char");
      if (chars) {
        tl.fromTo(chars,
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, stagger: 0.05, duration: 2, ease: "power4.out" },
          0
        );
      }
      tl.to(textRef.current, { y: "-60vh", duration: 10, ease: "none" }, 0);

      // 2. SLOWER, CLUSTERED CARD ANIMATION
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const t = TESTIMONIALS[i];
        const xOffset = isMobile ? "-50%" : (t.col === 1 ? "-50%" : t.col === 2 ? "-100%" : "0%");

        const spread = isMobile ? 30 : 22; 
        const targetY = -15 - (i * spread);

        tl.fromTo(card,
          {
            y: "85vh",
            x: isMobile ? "-50%" : xOffset,
            opacity: 0,
            scale: 0.9,
            rotation: i % 2 === 0 ? -2 : 2
          },
          {
            y: `${targetY}vh`,
            x: isMobile ? "-50%" : xOffset,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 8, 
            ease: "none" 
          },
          i * 2.0 // Entry stagger
        );

        // Exit animation timed to happen before the pin releases
        tl.to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 3
        }, (i * 2.0) + 8); 
      });
    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  return (
    <section
      ref={containerRef}
      style={{
        width: "100%",
        backgroundColor: "#000",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Section is exactly viewport height
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Inter:wght@400;600;800&display=swap');
      `}</style>

      {/* Background Text */}
      <h1
        ref={textRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translateX(-50%)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isMobile ? "18vw" : "clamp(100px, 16vw, 240px)",
          fontWeight: 900,
          color: "white",
          margin: 0,
          lineHeight: 0.85,
          letterSpacing: "-0.05em",
          display: "flex",
          zIndex: 1,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          opacity: 0.5
        }}
      >
        {"TESTIMONIALS".split("").map((char, i) => (
          <span key={i} style={{ display: "inline-block", overflow: "hidden" }}>
            <span className="char" style={{ display: "inline-block" }}>{char}</span>
          </span>
        ))}
      </h1>

      {/* Cards Container */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
        {TESTIMONIALS.map((t, i) => {
          const leftPos = isMobile ? "50%" : (t.col === 0 ? "12%" : t.col === 1 ? "50%" : "88%");
          const xOffset = isMobile ? "-50%" : (t.col === 1 ? "-50%" : t.col === 2 ? "-100%" : "0%");

          return (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              style={{
                position: "absolute",
                top: "50%",
                left: leftPos,
                transform: `translateX(${xOffset})`,
                width: isMobile ? "90vw" : "clamp(300px, 22vw, 380px)",
                pointerEvents: "auto"
              }}
            >
              <div style={{
                backgroundColor: t.bg,
                borderRadius: "28px",
                padding: isMobile ? "24px" : "32px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(12px)",
              }}>
                <p style={{ 
                  color: "white", 
                  fontFamily: "Inter", 
                  fontWeight: 600, 
                  fontSize: isMobile ? "14px" : "16px", 
                  lineHeight: 1.6, 
                  marginBottom: "20px",
                }}>
                  “{t.text}”
                </p>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "16px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "10px", fontWeight: "900", color: "white", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.name}</span>
                    <span style={{ fontSize: "11px", color: "white", opacity: 0.4 }}>{t.company}</span>
                  </div>
                  <div style={{ 
                    width: "42px", 
                    height: "42px", 
                    borderRadius: "50%", 
                    overflow: "hidden", 
                    border: "1.5px solid rgba(255,255,255,0.15)"
                  }}>
                    <img src={t.img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};