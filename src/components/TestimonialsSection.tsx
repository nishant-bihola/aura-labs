import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "CEO, TechFlow Solutions",
    quote: "Aura Labs transformed our digital presence. Within 30 days of launching our new React application and AI Chatbot, our lead conversion rate increased by 45%. Outstanding enterprise-level IT solutions.",
    rating: 5
  },
  {
    name: "Marcus Chen",
    role: "Director of Marketing, Elevate Retail",
    quote: "The AI motion ad content we received was breathtaking. It would have taken our previous agency weeks and a $10,000 budget to produce what Aura Labs delivered in 48 hours. Fast and reliable.",
    rating: 5
  },
  {
    name: "David Ross",
    role: "Founder, Ross Legal Group",
    quote: "Seamless integration from start to finish. They built a professional, highly secure platform that completely automated our booking workflow. An absolute game-changer for a growing business.",
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className="fluid-py fluid-px border-x border-white/5 mx-3 md:mx-6 bg-[#020202] relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-3 opacity-60 mb-6">
            <span className="w-12 h-[1px] bg-white"></span>
            <h2 className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium">Social Proof</h2>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter mb-6">
            Trusted by growing businesses.
          </h2>
          <p className="text-white/40 text-lg max-w-2xl font-light">
            Don't just take our word for it. Here is what our clients have to say about the quality, speed, and ROI of our IT solutions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.07] transition-all"
            >
              <div>
                <div className="flex items-center gap-1 mb-6 text-[#00F0FF]">
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/80 font-light leading-relaxed mb-8 text-sm md:text-base">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="font-bold text-white text-sm tracking-wide">{testimonial.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
