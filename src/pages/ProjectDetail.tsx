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
      <section className="min-h-[70vh] md:h-screen flex flex-col justify-center px-6 md:px-12 relative border-b border-white/10 py-20 md:py-0">
        <div className="overflow-hidden mb-12">
          <h1 className="hero-title fluid-h1 font-bold leading-[0.8] tracking-tighter uppercase text-center md:text-left">
            {project.title}
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end pb-12 w-full gap-8 md:gap-0">
          <div className="flex items-center gap-2 opacity-60">
            <ArrowDown size={14} className="animate-bounce" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
          </div>
          <div className="text-center md:text-right">
             <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
               Strategy, Concept, <br className="hidden md:block" /> {project.category}
             </p>
          </div>
        </div>
      </section>

      {/* 2. CONTENT GRID (Clone of image_2e0bee.jpg) */}
      <section className="content-grid fluid-px py-20 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-12 border-x border-white/5 mx-4 md:mx-6">
        {/* Left Info Column */}
        <div className="md:col-span-12 lg:col-span-5 space-y-12 md:space-y-24">
          <div className="space-y-8">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Overview</p>
            <h2 className="text-3xl md:text-5xl font-medium leading-[1.1] tracking-tight font-serif italic">
              {project.description}
            </h2>
          </div>

          <div className="pt-12 md:pt-24 border-t border-white/10 space-y-8">
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Client</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.client}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default border-t border-white/5 pt-8">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Date</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.year}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default border-t border-white/5 pt-8">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Service</span>
              <span className="text-sm font-medium group-hover:opacity-100 opacity-80 transition-opacity">{project.services?.join(", ") || project.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="px-4 md:px-12 py-12">
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="aspect-[4/3] md:aspect-[16/9] w-full rounded-[30px] md:rounded-[80px] overflow-hidden shadow-2xl shadow-black/50"
         >
            <img src={project.mainImage} className="w-full h-full object-cover" alt={project.title} />
         </motion.div>
      </section>

      {/* Overview & Gallery */}
      <section className="py-20 md:py-48 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
             <div className="lg:col-span-5">
                <h2 className="text-[10px] md:text-[12px] uppercase font-bold tracking-[0.4em] opacity-40 mb-8">Concept</h2>
                <p className="text-xl md:text-4xl font-serif italic leading-snug opacity-80">{project.description}</p>
             </div>
             <div className="lg:col-span-7 space-y-12 md:space-y-16">
                <div className="space-y-6">
                   <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-30">Highlights</h3>
                   <p className="text-base md:text-xl text-white/50 leading-relaxed font-light">{project.results}</p>
                </div>
                <div className="aspect-[4/3] w-full rounded-[30px] md:rounded-[50px] overflow-hidden bg-white/5">
                   <img src={project.galleryImages[0]} className="w-full h-full object-cover" alt="Gallery 1" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Recent Work - High Fidelity Grid */}
      <section className="py-20 md:py-40 px-6 md:px-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-8">
           <div>
              <h2 className="text-[10px] md:text-[12px] uppercase font-bold tracking-[0.4em] opacity-40 mb-4">Recent Work</h2>
              <h3 className="text-3xl md:text-5xl font-serif italic">More from the Lab</h3>
           </div>
           <button 
             onClick={() => {
               window.scrollTo({ top: 0, behavior: 'instant' });
               navigate('/#work');
             }} 
             className="w-full md:w-auto px-8 py-5 border border-white/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 active:scale-95"
           >
              View All Works
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
           {PROJECTS.filter(p => p.id !== project.id).slice(0, 2).map((relatedProject) => (
             <div 
               key={relatedProject.id}
               className="aspect-[4/3] md:aspect-square bg-neutral-100 rounded-[30px] md:rounded-[40px] overflow-hidden relative group cursor-pointer shadow-xl" 
               onClick={() => {
                 window.scrollTo({ top: 0, behavior: 'instant' });
                 navigate(`/work/${relatedProject.slug}`);
               }}
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

      {/* Project CTA Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 border-y border-white/5 bg-white text-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40">Ready to build?</h2>
            <h3 className="text-4xl md:text-6xl font-serif italic tracking-tighter">Start a project like this.</h3>
            <p className="text-lg opacity-60 max-w-md">Our team is ready to scale your vision using the same architectural precision applied to {project.title}.</p>
          </div>
          <button 
            onClick={() => navigate(`/contact?plan=Project&name=${project.title}`)}
            className="w-full md:w-auto px-12 py-6 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Inquire Now
          </button>
        </div>
      </section>

      {/* Impact Section - Responsive Typography */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black text-white text-center">
          <h2 className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.4em] opacity-40 mb-8 md:mb-12">The Impact</h2>
          <p className="text-2xl md:text-5xl lg:text-7xl font-serif italic tracking-tighter leading-[1.1] max-w-5xl mx-auto px-4">
            "{project.results}"
          </p>
      </section>
    </div>
  );
}