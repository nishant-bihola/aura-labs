import { motion } from "motion/react";

const SERVICES = [
  "SOCIAL MEDIA",
  "MARKETING",
  "DEVELOPMENT",
  "ART DIRECTION"
];

const SERVICE_DETAILS = [
  {
    id: "001",
    title: "Web Design",
    desc: "Modern, responsive, and user-friendly websites designed to engage visitors and drive conversions.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f0d15764f9b537dbd3c6_Scene%208.webp",
    categories: ["Wireframe", "Website", "Dashboard", "Product"]
  },
  {
    id: "002",
    title: "Social Media",
    desc: "We create scroll-stopping social content designed to build brand presence and drive engagement.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f113340019d414668f48_Scene%2016.webp",
    categories: ["Content", "Social", "Motion", "Campaign", "Brand"]
  },
  {
    id: "003",
    title: "Marketing",
    desc: "We develop strategic marketing assets that amplify brand reach and support growth.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f190a35a5530f343d2dc_Scene%20%237.webp",
    categories: ["Campaign", "Digital Ads", "Branding", "Visual"]
  },
  {
    id: "004",
    title: "Brand Identity",
    desc: "We craft cohesive brand identities that communicate purpose, personality, and credibility.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f1b043ee0ff6d8a9d40a_Scene%20%234.webp",
    categories: ["Brand", "Visual", "Logo Design", "Typography"]
  },
  {
    id: "005",
    title: "Content",
    desc: "We craft content that communicates clearly, connects emotionally, and performs strategically.",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f1df0da893d7023f53bf_Scene%20%239.webp",
    categories: ["Copywriting", "Visual", "Motion", "Editorial"]
  }
];

export default function ServicesSection() {
  return (
    <section className="bg-brand-bg px-4 md:px-0 border-x border-border-soft mx-4 md:mx-6 relative overflow-hidden">
      {/* Infinite Horizontal Scroller */}
      <div className="flex whitespace-nowrap border-y border-border-soft py-12 md:py-20 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 md:gap-24 px-6 md:px-12"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-24">
              {SERVICES.map((s) => (
                <div key={s} className="flex items-center gap-12 md:gap-24">
                  <span className="text-6xl md:text-[8vw] lg:text-[10vw] font-black uppercase tracking-tighter font-display leading-[0.8] opacity-100 text-white">
                    {s}
                  </span>
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-white opacity-100" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start border-b border-border-soft pb-20 md:pb-32 mb-20 md:mb-32">
          <div className="space-y-8 md:space-y-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] md:leading-[1] tracking-tighter font-display text-white">
              Timeless design powered by <br /> modern growth strategy.
            </h2>
            <div className="pt-4">
              <a href="#work" className="bg-white text-black px-6 py-3 rounded-full text-xs uppercase kerning-wide font-bold hover:scale-105 transition-transform inline-block">
                VIEW ALL WORKS
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {SERVICE_DETAILS.map((service) => (
            <div key={service.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center group py-12 md:py-16 border-t border-white/5">
              <div className="hidden md:block col-span-1 text-sm font-medium opacity-20 serif italic">{service.id}</div>
              <div className="col-span-1 md:col-span-4 aspect-[16/9] md:aspect-[4/3] rounded-2xl overflow-hidden bg-[#111]">
                 <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="col-span-1 md:col-span-7 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 pl-0 md:pl-8">
                <div className="space-y-4 max-w-sm">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{service.title}</h3>
                  <p className="font-medium opacity-60 leading-relaxed text-sm md:text-base">{service.desc}</p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] uppercase kerning-wide font-bold opacity-100 tracking-widest block mb-4">Categories</span>
                  <div className="flex flex-wrap gap-2 md:max-w-[200px]">
                    {service.categories.map(c => (
                      <span key={c} className="text-[11px] md:text-[12px] bg-white/10 text-white border border-white/5 px-3 py-1.5 rounded uppercase tracking-wide font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
