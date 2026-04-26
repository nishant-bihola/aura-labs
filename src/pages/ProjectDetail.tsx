import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowDown, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../data/projects";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const project = PROJECTS.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!project) return;

    const ctx = gsap.context(() => {
      // Reveal Main Title
      gsap.from(".hero-title", {
        y: 150,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.2
      });

      // Parallax for Bento Images
      gsap.to(".parallax-img", {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: ".content-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [project]);

  if (!project) return <div className="h-screen bg-black text-white flex items-center justify-center">Project Not Found</div>;

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
      {/* 1. HERO SECTION (Clone of image_2e0c0d.png) */}
      <section className="h-screen flex flex-col justify-center px-6 md:px-12 relative border-b border-white/10">
        <div className="overflow-hidden mb-12">
          <h1 className="hero-title text-[18vw] font-bold leading-[0.8] tracking-tighter uppercase text-center md:text-left">
            {project.title}
          </h1>
        </div>
        
        <div className="flex justify-between items-end pb-12 w-full">
          <div className="flex items-center gap-2 opacity-60">
            <ArrowDown size={14} className="animate-bounce" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
          </div>
          <div className="text-right">
             <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
               Strategy, Concept, <br /> {project.category}
             </p>
          </div>
        </div>
      </section>

      {/* 2. CONTENT GRID (Clone of image_2e0bee.jpg) */}
      <section className="content-grid px-6 md:px-12 py-32 grid grid-cols-1 md:grid-cols-12 gap-12 border-x border-white/5 mx-4 md:mx-6">
        {/* Left Info Column */}
        <div className="md:col-span-5 space-y-24">
          <div className="space-y-8">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Overview</p>
            <h2 className="text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight font-serif italic">
              {project.description}
            </h2>
          </div>

          <div className="pt-24 border-t border-white/10 space-y-8">
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Client</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.client}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default border-t border-white/5 pt-8">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Data</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.year}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default border-t border-white/5 pt-8">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Service</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.category}</span>
            </div>
          </div>
        </div>

        {/* Right Media Column */}
        <div className="md:col-span-6 md:col-start-7 space-y-12">
          <div className="parallax-img rounded-[32px] overflow-hidden aspect-[4/5] bg-neutral-900 group">
            <img src={project.mainImage} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" alt="Hero" />
          </div>
          <div className="parallax-img rounded-[32px] overflow-hidden aspect-video bg-neutral-900 group">
            <img src={project.galleryImages[0]} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" alt="Gallery 1" />
          </div>
        </div>
      </section>

      {/* 3. RECENT WORK SECTION (Dynamic & Responsive) */}
      <section className="py-20 md:py-32 px-4 md:px-12 bg-white text-black rounded-t-[32px] md:rounded-t-[64px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
           <h2 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-none fluid-h1">Recent Work</h2>
           <button 
             onClick={() => navigate('/#work')} 
             className="w-full md:w-auto px-8 py-5 border border-black rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 active:scale-95"
           >
              View All Works
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
           {PROJECTS.filter(p => p.id !== project.id).slice(0, 2).map((relatedProject) => (
             <div 
               key={relatedProject.id}
               className="aspect-[4/3] md:aspect-square bg-neutral-100 rounded-[30px] md:rounded-[40px] overflow-hidden relative group cursor-pointer shadow-xl" 
               onClick={() => navigate(`/work/${relatedProject.slug}`)}
             >
                <img src={relatedProject.mainImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={relatedProject.title} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white z-10 flex items-center gap-3 md:gap-4 group-hover:translate-x-2 transition-transform duration-500">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{relatedProject.category}</span>
                      <h4 className="text-2xl md:text-3xl font-serif italic">{relatedProject.title}</h4>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowUpRight size={18} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Impact Section - Responsive Typography */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-black text-white text-center">
          <h2 className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.4em] opacity-40 mb-8 md:mb-12">The Impact</h2>
          <p className="text-3xl md:text-7xl lg:text-8xl font-serif italic tracking-tighter leading-[1.1] max-w-5xl mx-auto px-4">
            "{project.results}"
          </p>
      </section>
    </div>
  );
}