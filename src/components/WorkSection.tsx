"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECTS } from "../data/projects";

export default function WorkSection() {
  return (
    <section id="work" className="py-20 md:py-32 px-4 md:px-6 border-x border-white/5 mx-4 md:mx-6 relative bg-black">
      {/* Cinematic Background Text - Matches Valtero Style */}
      {/* Cinematic Background Text - Matches Valtero Style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] md:text-[40vw] font-black opacity-[0.02] select-none pointer-events-none serif italic leading-none text-white whitespace-nowrap">
        Works
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 text-white">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-12 md:mb-24 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 opacity-60">
                <span className="w-6 h-[1px] bg-white"></span>
                <h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium">
                  Portfolio Selection
                </h2>
             </div>
             <h3 className="text-xl md:text-2xl font-serif italic opacity-40 md:ml-8">Featured Work / 2026</h3>
          </div>
          
          <div className="text-right hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40">Berlin • Tokyo • New York</p>
          </div>
        </div>

        {/* Dynamic Project List Mapping All Items in PROJECTS */}
        <div className="flex flex-col border-t border-white/10">
          {PROJECTS.map((project) => (
            <Link 
              key={project.id} 
              to={`/work/${project.slug}`} 
              className="group block no-underline border-b border-white/10"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                data-cursor="view-more"
                className="relative py-8 md:py-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 cursor-none transition-colors hover:bg-white/[0.02] px-2 md:px-4"
              >
                {/* Floating Preview Image (Clone Valtero Reveal) */}
                <div className="absolute left-1/2 top-0 w-64 h-80 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none hidden lg:block overflow-hidden rounded-sm z-10 -translate-x-1/2 -translate-y-1/2 mt-10 rotate-2 group-hover:rotate-0">
                  <img 
                    src={project.mainImage} 
                    alt={project.title} 
                    className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-1000 grayscale group-hover:grayscale-0 brightness-75 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
                </div>

                {/* Project ID and Title */}
                <div className="flex items-center gap-4 md:gap-16 relative z-20 w-full md:w-auto">
                  <span className="text-[10px] md:text-sm font-medium opacity-20 serif italic min-w-[2ch]">{project.id}</span>
                  <h3 className="text-3xl md:text-7xl lg:text-[6.5vw] font-normal serif italic tracking-tighter group-hover:translate-x-4 md:group-hover:pl-8 transition-all duration-700 ease-out leading-none">
                    {project.title}
                  </h3>
                </div>

                {/* Category, Year, and Icon */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-4 md:gap-1 relative z-20">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-80">
                      {project.category}
                    </p>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 transform group-hover:scale-110 shrink-0">
                        <ArrowUpRight size={14} className="md:w-4 md:h-4 group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium opacity-30">
                    Case Study — {project.year}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Bottom Spacer Section */}
      <div className="mt-20 flex justify-center opacity-20">
         <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}