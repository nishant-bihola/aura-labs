import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

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
    <div className="group relative py-20 border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <div className="max-w-7xl mx-auto fluid-px">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          
          {/* 001 - Numbering */}
          <div className="hidden md:flex items-start">
            <div className="bg-white text-black px-3 py-1 rounded-md font-black text-[11px] tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {service.id}
            </div>
          </div>

          {/* Image Side */}
          <div className="w-full lg:w-[40%] xl:w-[35%] shrink-0">
            <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-[#0A0A0A] border border-white/10 group-hover:border-white/20 transition-colors shadow-2xl">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-grow space-y-6 lg:pt-4">
            <div className="space-y-4">
              <h3 className="fluid-h2 font-bold tracking-tight text-white leading-none">
                {service.title}
              </h3>
              <p className="text-white/40 text-lg font-light leading-relaxed max-w-xl">
                {service.desc}
              </p>
            </div>
          </div>

          {/* Categories Side */}
          <div className="w-full lg:w-[25%] space-y-4 lg:pt-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block mb-4">Categories</span>
            <div className="flex flex-wrap gap-2">
              {service.categories.map((c) => (
                <span 
                  key={c} 
                  className="text-[10px] bg-white/5 text-white/70 border border-white/5 px-4 py-2 rounded-lg font-bold hover:bg-white hover:text-black transition-all duration-300 cursor-default"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="bg-black relative pt-32 pb-12 overflow-hidden selection:bg-white selection:text-black mx-3 md:mx-6 border-x border-white/5">
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

