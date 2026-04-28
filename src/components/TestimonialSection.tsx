"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    text: "Working with Aura Lab felt like having an internal team rather than an external agency. They were proactive, detail-oriented, and genuinely invested in the outcome.",
    name: "DANIEL MORGAN",
    company: "Acme",
    side: "left",
    bg: "#111111",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    text: "Their ability to listen, challenge assumptions, and translate ideas into a clean digital system made a real difference for our brand.",
    name: "ELENA ROSSI",
    company: "FR",
    side: "center",
    bg: "#171717",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  {
    text: "We didn't just get a website — we got a solid digital foundation. Aura Lab is the kind of partner you want when building something meant to last.",
    name: "MICHAEL TURNER",
    company: "Radius",
    side: "left",
    bg: "#141414",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    text: "The final product wasn't just beautiful — it performed. Aura Lab helped us improve conversion, simplify our messaging, and build a system we can confidently scale.",
    name: "JAMES WHITAKER",
    company: "Alt+Shift",
    side: "center",
    bg: "#111111",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    text: "Aura Lab brought clarity to a very complex project. Their ability to translate ideas into a clean digital system was exceptional.",
    name: "LAURA BIANCHI",
    company: "Square",
    side: "left",
    bg: "#171717",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  {
    text: "What stood out was the balance between design quality and technical execution. Everything was thoughtful, scalable, and built with long-term use in mind.",
    name: "SOPHIA KLEIN",
    company: "Nebula",
    side: "center",
    bg: "#141414",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
];

export default function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const ctx = gsap.context(() => {
      // Each card takes ~700px of scroll, total = 6 * 700 = 4200 + 600 buffer
      const totalScroll = TESTIMONIALS.length * 700 + 800;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalScroll}`,
          scrub: 1.2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // TEXT FILL: left-to-right reveal tied to scroll progress
      tl.fromTo(
        fillRef.current,
        { width: "0%" },
        { width: "100%", ease: "none", duration: TESTIMONIALS.length * 2 },
        0
      );

      // CARDS: scroll up from bottom, staggered, each one overlapping
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const startTime = i * 1.8;

        tl.fromTo(
          card,
          { y: "110vh", opacity: 0, scale: 0.92 },
          {
            y: isMobile ? "-10vh" : "-5vh",
            opacity: 1,
            scale: 1,
            duration: 3.5,
            ease: "power2.out",
          },
          startTime
        );

        // Fade out before next card comes in fully
        tl.to(
          card,
          { opacity: 0, y: "-40vh", scale: 0.95, duration: 2, ease: "power2.in" },
          startTime + 3.5
        );
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
        height: "100vh",
        backgroundColor: "#000",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,900;1,900&family=Inter:wght@400;600;800&display=swap');
        .testi-outline {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.12);
        }
      `}</style>

      {/* GIANT BACKGROUND TEXT — outline ghost layer */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isMobile ? "22vw" : "clamp(120px, 20vw, 320px)",
          fontWeight: 900,
          lineHeight: 0.85,
          letterSpacing: "-0.03em",
          zIndex: 1,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {/* Outline / ghost */}
        <span className="testi-outline" style={{ display: "block" }}>
          TESTIMONIALS
        </span>

        {/* Filled layer — clips from left to right via width */}
        <div
          ref={fillRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
            color: "white",
            whiteSpace: "nowrap",
            width: "0%",
          }}
        >
          TESTIMONIALS
        </div>
      </div>

      {/* CARDS */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}>
        {TESTIMONIALS.map((t, i) => {
          const isLeft = t.side === "left";
          const leftPos = isMobile ? "50%" : isLeft ? "30%" : "58%";
          const xShift = isMobile ? "-50%" : isLeft ? "-50%" : "-50%";

          return (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              style={{
                position: "absolute",
                top: "50%",
                left: leftPos,
                transform: `translateX(${xShift})`,
                width: isMobile ? "88vw" : "clamp(340px, 28vw, 440px)",
                pointerEvents: "auto",
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  backgroundColor: t.bg,
                  borderRadius: "20px",
                  padding: isMobile ? "28px 24px" : "36px 40px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
                }}
              >
                {/* Quote text */}
                <p
                  style={{
                    color: "white",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: isMobile ? "15px" : "17px",
                    lineHeight: 1.65,
                    marginBottom: "28px",
                    opacity: 0.95,
                  }}
                >
                  "{t.text}"
                </p>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "20px" }} />

                {/* Author row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 900,
                        fontSize: "13px",
                        letterSpacing: "0.12em",
                        color: "white",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "3px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t.company}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1.5px solid rgba(255,255,255,0.15)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={t.img}
                      alt={t.name}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}