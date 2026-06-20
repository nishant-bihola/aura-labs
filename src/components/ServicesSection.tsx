import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SERVICE_DETAILS = [
  {
    id: "01",
    title: "Web Development",
    bgText: "BUILD",
    desc: "From corporate websites to comprehensive ordering platforms, our web solutions ensure seamless integration and reliable performance. Starting at $1,500.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&auto=format&fit=crop&q=80",
    categories: ["React", "Node.js", "Web Apps", "E-Commerce", "SEO"],
    href: "/services/web-development"
  },
  {
    id: "02",
    title: "AI Chatbots",
    bgText: "SMART",
    desc: "Custom AI chatbots tailored to your business needs. Provide round-the-clock support, streamline bookings, and enhance customer engagement effortlessly. Starting at $800.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&auto=format&fit=crop&q=80",
    categories: ["Lead Gen", "Bookings", "24/7 Support", "AI-Powered"],
    href: "/services/ai-chatbots"
  },
  {
    id: "03",
    title: "AI Ad Content",
    bgText: "MOTION",
    desc: "Premium motion ads and product imagery powered by generative AI. Optimize your marketing campaigns with rapid delivery and impactful visuals. From $800/campaign.",
    image: "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=900&auto=format&fit=crop&q=80",
    categories: ["Motion Ads", "Product Images", "15-sec Video", "Campaign"],
    href: "/services/ai-ads"
  },
  {
    id: "04",
    title: "Brand Identity",
    bgText: "IDENTITY",
    desc: "Comprehensive visual identity systems designed to establish trust and credibility. Ensure your business is recognized as a leader from day one.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&auto=format&fit=crop&q=80",
    categories: ["Logo Design", "Typography", "Brand Guide", "Visual System"],
    href: "/services/brand-identity"
  }
];

function ServiceCard({ service }: { service: typeof SERVICE_DETAILS[0] }) {
  const navigate = useNavigate();

  const startProject = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(service.href);
  };

  return (
    <div onClick={startProject} className="group relative py-16 md:py-32 border-b border-white/5 transition-colors hover:bg-white/[0.01] overflow-hidden cursor-pointer">
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
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // Never leave a black box if a remote image fails — fall
                  // back to a branded gradient placeholder.
                  const el = e.currentTarget;
                  el.style.display = "none";
                  el.parentElement?.classList.add("media-fallback");
                }}
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

            {/* Tags (Mobile) */}
            <div className="flex flex-wrap gap-2 md:hidden">
              {service.categories.map((c) => (
                <span key={c} className="text-[9px] bg-white/5 text-white/40 border border-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Categories & Action Column (Desktop) */}
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

          {/* Mobile Action */}
          <div className="lg:hidden flex justify-between items-center w-full pt-4 border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Start a Project</span>
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
      <div className="max-w-7xl mx-auto fluid-px mb-20">
         <div className="flex justify-between items-end border-b border-white/10 pb-12">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 opacity-60">
                  <span className="w-12 h-[1px] bg-white"></span>
                  <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium">Expertise</h2>
               </div>
               <h3 className="text-xl md:text-4xl font-valtero-serif italic opacity-40 md:ml-12">Innovative Solutions</h3>
            </div>
            <div className="text-right hidden lg:block opacity-30">
               <p className="text-[10px] uppercase tracking-[0.3em] font-medium">Click a service to start a project</p>
            </div>
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
