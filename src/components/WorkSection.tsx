"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECTS } from "../data/projects";
import { useState, useRef } from "react";

function ProjectItem({ project }: { project: typeof PROJECTS[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the cursor follow effect
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map the mouse position to a slight offset for the image
  const rotate = useTransform(smoothX, [-200, 200], [-5, 5]);
  const xOffset = useTransform(smoothX, [-200, 200], [-20, 20]);
  const yOffset = useTransform(smoothY, [-200, 200], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  return (
    <Link 
      to={`/work/${project.slug}`} 
      className="group block no-underline border-b border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative py-10 md:py-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 cursor-none transition-colors hover:bg-white/[0.01] px-0 md:px-8 overflow-visible"
      >
        {/* Floating Preview Image (Cinematic Follow) */}
        <motion.div 
          style={{ 
            x: xOffset, 
            y: yOffset, 
            rotate,
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
            willChange: "transform, opacity" // Performance optimization
          }}
          className="absolute left-1/2 top-1/2 w-64 h-80 pointer-events-none hidden lg:block overflow-hidden rounded-xl z-50 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 shadow-2xl"
        >
          <img 
            src={project.mainImage} 
            alt={project.title} 
            loading="lazy" // Fast load optimization
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>

        {/* Project ID and Title */}
        <div className="flex items-center gap-6 md:gap-20 relative z-20 w-full md:w-auto">
          <span className="text-[10px] md:text-sm font-medium opacity-20 serif italic min-w-[3ch]">{project.id}</span>
          <h3 className="text-3xl md:text-6xl lg:text-[7vw] font-normal font-valtero-serif italic tracking-tighter group-hover:translate-x-6 transition-transform duration-700 ease-expo leading-tight md:leading-none">
            {project.title}
          </h3>
        </div>

        {/* Category, Year, and Icon */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-4 md:gap-2 relative z-20 pt-2 md:pt-0">
          <div className="flex items-center gap-4">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
              {project.category}
            </p>
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 transform group-hover:scale-110 shrink-0">
                <ArrowUpRight size={18} className="md:w-6 md:h-6 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium opacity-20 group-hover:opacity-40 transition-opacity hidden md:block">
            Case Study — {project.year}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function WorkSection() {
  return (
    <section id="work" className="fluid-py fluid-px border-x border-white/5 mx-3 md:mx-6 relative bg-black overflow-visible">
      {/* Cinematic Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] md:text-[40vw] font-black opacity-[0.01] select-none pointer-events-none serif italic leading-none text-white whitespace-nowrap">
        Works
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 text-white">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-16 md:mb-32 border-b border-white/10 pb-12">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3 opacity-60">
                <span className="w-12 h-[1px] bg-white"></span>
                <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium">
                  Selected Portfolio
                </h2>
             </div>
              <h3 className="text-xl md:text-4xl font-valtero-serif italic opacity-40 md:ml-12">Featured Work / 2025-26</h3>
          </div>
          
          <div className="text-right hidden lg:block opacity-30">
            <p className="text-[10px] uppercase tracking-[0.3em] font-medium">Berlin • Tokyo • New York</p>
          </div>
        </div>

        {/* Dynamic Project List */}
        <div className="flex flex-col border-t border-white/10">
          {PROJECTS.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
      
      {/* Bottom Spacer */}
      <div className="mt-32 flex justify-center">
         <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}