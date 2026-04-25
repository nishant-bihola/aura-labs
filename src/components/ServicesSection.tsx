import { motion } from "motion/react";

const SERVICES = [
  "Web Design",
  "Social Media",
  "Marketing",
  "Development",
  "Branding",
  "UI/UX Animation",
  "Motion Graphics",
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
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 md:gap-24 px-6 md:px-12"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-24">
              {SERVICES.map((s) => (
                <div key={s} className="flex items-center gap-12 md:gap-24">
                  <span className="text-6xl md:text-9xl font-normal uppercase tracking-tighter serif italic opacity-30">
                    {s}
                  </span>
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-brand-text opacity-20" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start border-b border-border-soft pb-20 md:pb-32 mb-20 md:mb-32">
          <div className="space-y-8 md:space-y-12">
            <h2 className="text-4xl md:text-7xl font-normal leading-[1.1] md:leading-[0.9] serif italic tracking-tighter">
              Timeless design powered by modern growth strategy.
            </h2>
            <p className="text-base md:text-lg text-brand-gray font-light max-w-sm">
              From early-stage teams establishing their online presence to established businesses ready to elevate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-12 md:gap-y-20 gap-x-12 lg:pl-12 lg:border-l border-border-soft">
            {[
              { label: "Location", value: "Berlin, DE" },
              { label: "Duration", value: "18 Months" },
              { label: "Category", value: "Agency" },
              { label: "Focus", value: "Design & Tech" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 md:gap-3">
                <span className="text-[9px] md:text-[10px] uppercase kerning-wide opacity-40 font-bold">{stat.label}</span>
                <span className="text-lg md:text-xl font-medium tracking-tight">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-24 md:space-y-32">
          {SERVICE_DETAILS.map((service) => (
            <div key={service.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start group">
              <div className="hidden md:block col-span-1 text-sm font-medium opacity-20 serif italic">{service.id}</div>
              <div className="col-span-1 md:col-span-6 aspect-[4/3] rounded-sm overflow-hidden bg-[#111]">
                 <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="col-span-1 md:col-span-5 flex flex-col justify-center h-full">
                <div className="space-y-6">
                  <h3 className="text-4xl md:text-5xl serif italic font-normal tracking-tight">{service.title}</h3>
                  <p className="font-light opacity-60 leading-relaxed text-base md:text-lg">{service.desc}</p>
                  <div className="pt-4 flex flex-wrap gap-2">
                    {service.categories.map(c => (
                      <span key={c} className="text-[10px] md:text-[11px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-wide">{c}</span>
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
