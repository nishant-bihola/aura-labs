"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function EvolutionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = textRef.current;
    const content = text.textContent || "";
    text.innerHTML = content
      .split(" ")
      .map((word) => `
        <span class="word inline-block whitespace-nowrap">
          ${word.split("").map(char => `<span class="char opacity-20 inline-block">${char}</span>`).join("")}
        </span>
      `)
      .join("<span class='char opacity-20'>&nbsp;</span>");

    const chars = text.querySelectorAll(".char");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    });

    tl.to(chars, {
      color: "#ffffff",
      opacity: 1,
      stagger: 0.1,
      ease: "none",
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="w-full min-h-[60vh] flex items-center justify-center bg-[#050505] fluid-px fluid-py border-x border-white/5 mx-3 md:mx-6"
    >
      <h2 
        ref={textRef}
        className="fluid-h1 font-valtero-serif italic text-white/10 text-center leading-[1.05] tracking-tight max-w-6xl"
      >
        IT solutions for a growing business.
      </h2>
    </section>
  );
}
