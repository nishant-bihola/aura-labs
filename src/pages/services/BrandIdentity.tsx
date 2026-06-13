import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";

export default function BrandIdentity() {
  useEffect(() => {
    document.title = "Brand Identity & Design Systems | Professional Assets | Aura Labs";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", "Establish a premium brand identity. We design logos, custom typography, social media assets, and comprehensive style guides tailored for enterprise growth.");
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  const features = [
    "Primary and Secondary Logo Design",
    "Comprehensive Brand Guidelines",
    "Color Palette & Typography Selection",
    "Social Media Asset Kit",
    "Business Card & Letterhead Design",
    "Full Commercial Usage Rights"
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00f0ff] selection:text-black pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 opacity-60 mb-6">
            <span className="w-12 h-[1px] bg-white"></span>
            <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium">Service</h2>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif italic tracking-tighter leading-[0.9] mb-8">
            Brand <br className="hidden md:block"/> Identity.
          </h1>
          <p className="text-white/50 text-lg md:text-2xl font-light max-w-2xl leading-relaxed">
            Comprehensive visual identity systems designed to establish trust and credibility. Ensure your business is recognized as a leader from day one.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl md:text-4xl font-serif italic">More than just a logo.</h3>
            <p className="text-white/40 leading-relaxed font-light">
              Your brand is the foundation of your enterprise. It communicates your values, builds trust, and differentiates you from competitors. We create comprehensive visual identity systems that go far beyond a simple logo.
            </p>
            <p className="text-white/40 leading-relaxed font-light">
              From defining your brand's unique color palette and typography to delivering a rigorous brand guideline document, we ensure that every customer touchpoint is consistent, professional, and impactful.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12"
          >
            <h4 className="text-xl md:text-2xl font-serif mb-8">What's Included</h4>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-white/70">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} className="text-[#00F0FF]" />
                  </div>
                  <span className="text-sm md:text-base font-light">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[3rem] p-12 md:p-24 relative overflow-hidden"
        >
          <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-full h-full bg-white/5 blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-3xl md:text-6xl font-serif italic tracking-tighter mb-6">Build your identity.</h2>
          <p className="text-white/50 mb-12 max-w-xl mx-auto font-light">
            Contact us to discuss your vision and receive a custom quote for a complete brand identity package.
          </p>
          <Link 
            to="/contact?plan=Brand%20Identity"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 transition-transform"
          >
            Start Strategy <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
