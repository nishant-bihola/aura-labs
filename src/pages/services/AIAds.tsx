import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";

export default function AIAds() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const features = [
    "15-second Motion Video Ads",
    "Generative AI Product Imagery",
    "High-converting Scripts & Storyboards",
    "Platform-Optimized Formats (IG, TikTok)",
    "Rapid 24-48 Hour Delivery",
    "A/B Testing Variations Included"
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
            AI Ad <br className="hidden md:block"/> Content.
          </h1>
          <p className="text-white/50 text-lg md:text-2xl font-light max-w-2xl leading-relaxed">
            Premium motion ads and product imagery powered by generative AI. Optimize your marketing campaigns with rapid delivery and impactful visuals.
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
            <h3 className="text-2xl md:text-4xl font-serif italic">Studio quality, without the studio.</h3>
            <p className="text-white/40 leading-relaxed font-light">
              Traditional video production requires actors, sets, lighting, and weeks of editing—costing thousands of dollars per campaign. We leverage cutting-edge generative AI to produce breathtaking, photorealistic product images and cinematic motion ads in a fraction of the time.
            </p>
            <p className="text-white/40 leading-relaxed font-light">
              Our creatives are purpose-built for high-performance marketing channels like Instagram, TikTok, and LinkedIn. We deliver assets that capture attention instantly and drive measurable conversions for your growing business.
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
          <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-full h-full bg-[#00F0FF]/10 blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-3xl md:text-6xl font-serif italic tracking-tighter mb-6">Launch your campaign.</h2>
          <p className="text-white/50 mb-12 max-w-xl mx-auto font-light">
            Targeted AI ad packages start at $800. Get high-quality ad creatives and product imagery delivered rapidly.
          </p>
          <Link 
            to="/checkout?plan=AI%20Content"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 transition-transform"
          >
            Start Campaign <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
