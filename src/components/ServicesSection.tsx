import { motion } from "motion/react";

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
    <section className="bg-brand-bg px-4 md:px-0 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        
        <div className="flex flex-col items-center text-center pb-20 md:pb-32 mb-10">
          <h2 className="text-3xl md:text-[2.75rem] font-bold leading-[1.2] tracking-tight text-white mb-8">
            Timeless design powered by<br />modern growth strategy.
          </h2>
          <a href="#work" className="bg-white text-black px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform inline-block">
            VIEW ALL WORKS
          </a>
        </div>

        <div className="space-y-0">
          {SERVICE_DETAILS.map((service) => (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              key={service.id} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start py-12 md:py-16 border-t border-white/10 group"
            >
              <div className="lg:col-span-1 hidden lg:flex">
                 <div className="bg-white text-black text-[11px] font-bold px-2 py-1 rounded-full w-9 h-9 flex items-center justify-center">
                    {service.id}
                 </div>
              </div>
              <div className="lg:col-span-4 rounded-[1.25rem] overflow-hidden bg-[#111] relative aspect-[16/9]">
                 <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    src={service.image} alt={service.title} className="w-full h-full object-cover" 
                 />
              </div>
              <div className="lg:col-span-4 lg:col-start-6 flex flex-col space-y-3 pt-2">
                  <h3 className="text-3xl md:text-3xl font-bold tracking-tight text-white">{service.title}</h3>
                  <p className="font-medium opacity-60 leading-relaxed text-sm md:text-base max-w-xs">{service.desc}</p>
              </div>
              <div className="lg:col-span-3 lg:col-start-10 space-y-3 pt-2">
                  <span className="text-[10px] uppercase kerning-wide font-bold opacity-100 tracking-widest block mb-4">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {service.categories.map(c => (
                      <span key={c} className="text-[11px] bg-transparent text-white border border-white/20 px-3 py-1.5 rounded uppercase font-semibold">{c}</span>
                    ))}
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
