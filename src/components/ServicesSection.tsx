import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const SERVICE_DETAILS = [
  {
    id: "01",
    title: "Web Design",
    bgText: "DIGITAL",
    desc: "Modern, responsive, and user-friendly websites designed to engage visitors and drive conversions.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f0d15764f9b537dbd3c6_Scene%208.webp",
    categories: ["Wireframe", "Website", "Dashboard", "Product"]
  },
  {
    id: "02",
    title: "Social Media",
    bgText: "SOCIAL",
    desc: "We create scroll-stopping social content designed to build brand presence and drive engagement.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f113340019d414668f48_Scene%2016.webp",
    categories: ["Content", "Social", "Motion", "Campaign", "Brand"]
  },
  {
    id: "03",
    title: "Marketing",
    bgText: "GROWTH",
    desc: "We develop strategic marketing assets that amplify brand reach and support growth.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f190a35a5530f343d2dc_Scene%20%237.webp",
    categories: ["Campaign", "Digital Ads", "Branding", "Visual"]
  },
  {
    id: "04",
    title: "Brand Identity",
    bgText: "IDENTITY",
    desc: "We craft cohesive brand identities that communicate purpose, personality, and credibility.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f1b043ee0ff6d8a9d40a_Scene%20%234.webp",
    categories: ["Brand", "Visual", "Logo Design", "Typography"]
  },
  {
    id: "05",
    title: "Content",
    bgText: "CREATIVE",
    desc: "We craft content that communicates clearly, connects emotionally, and performs strategically.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f1df0da893d7023f53bf_Scene%20%239.webp",
    categories: ["Copywriting", "Visual", "Motion", "Editorial"]
  }
];

function ServiceCard({ service }: { service: typeof SERVICE_DETAILS[0] }) {
  return (
    <div className="group relative py-16 md:py-32 border-b border-white/5 transition-colors hover:bg-white/[0.01] overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-[0.02] select-none transition-transform duration-1000 group-hover:-translate-x-0">
        <span className="text-[15vw] font-black italic tracking-tighter uppercase leading-none">
          {service.bgText}
        </span>
      </div>

      <div className="max-w-7xl mx-auto fluid-px relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[0.8fr_1.5fr_0.7fr] gap-12 lg:gap-20 items-center">
          
          {/* 1. Image Column */}
          <div className="w-full relative">
            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-[#0A0A0A] border border-white/10 group-hover:border-white/20 transition-all duration-500 shadow-2xl">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              
              {/* Floating ID Tag */}
              <div className="absolute top-6 left-6 md:top-8 md:left-8">
                 <div className="bg-white text-black px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                   {service.id}
                 </div>
              </div>
            </div>
          </div>

          {/* 2. Text Content Column */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-4xl md:text-6xl lg:text-7xl font-normal font-valtero-serif italic tracking-tight text-white leading-[0.9] group-hover:text-[#00F0FF] transition-colors duration-500">
                {service.title}
              </h3>
              <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                {service.desc}
              </p>
            </div>
            
            {/* Tags (Desktop: Visible here, Mobile: Stacked) */}
            <div className="flex flex-wrap gap-2 md:hidden">
              {service.categories.map((c) => (
                <span key={c} className="text-[9px] bg-white/5 text-white/40 border border-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Stats/Categories & Action Column (Desktop Only) */}
          <div className="hidden lg:flex flex-col items-end gap-12">
            <div className="flex flex-col items-end gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Capabilities</span>
              <div className="flex flex-col items-end gap-2">
                {service.categories.map((c) => (
                  <span 
                    key={c} 
                    className="text-xs text-white/40 font-medium hover:text-white transition-colors cursor-default whitespace-nowrap"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 transform group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
               <ArrowUpRight size={28} className="group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>

          {/* Mobile Action Button */}
          <div className="lg:hidden flex justify-between items-center w-full pt-4 border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">View Portfolio</span>
            <ArrowUpRight size={24} className="text-white/50" />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="bg-black relative fluid-py overflow-hidden selection:bg-white selection:text-black mx-3 md:mx-6 border-x border-white/5">
      {/* SECTION HEADER - Subtle but present */}
      <div className="max-w-7xl mx-auto fluid-px mb-20">
         <div className="flex items-center gap-4 opacity-20">
            <div className="h-px w-12 bg-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Expertise</span>
         </div>
      </div>

      <div className="flex flex-col">
        {SERVICE_DETAILS.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

