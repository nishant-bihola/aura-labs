import { motion } from "motion/react";
import Counter from "./Counter";

const CHAT_MESSAGES = [
  { text: "Platform looks excellent.", side: "left", delay: 0.5 },
  { text: "Systems are fully integrated.", side: "left", delay: 1.2 },
  { text: "Can we add automated workflows?", side: "left", delay: 2.0 },
  { text: "Yes, we can deploy that.", side: "right", delay: 3.0 },
  { text: "Live in 48 hours.", side: "right", delay: 3.5 },
  { text: "Outstanding work.", side: "left", delay: 4.5 },
];

export default function SuccessSection() {
  return (
    <section className="fluid-py fluid-px border-x border-white/5 mx-3 md:mx-6 bg-black relative">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          
          {/* Left Content */}
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3 opacity-40">
                <span className="w-10 h-px bg-white" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Performance</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-[5.5vw] font-normal font-valtero-serif italic leading-[0.9] tracking-tighter text-white">
                Built for your success.
              </h2>
              <p className="text-lg md:text-xl font-light text-white/50 max-w-md leading-relaxed">
                Based in Edmonton, building for clients worldwide. From first conversation to live launch, we move fast and keep every detail aligned with your vision.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
               {[
                 { val: 100, suffix: "%", label: "Mobile responsive" },
                 { val: 3, suffix: "+", label: "Clients launched" },
                 { val: 24, suffix: "h", label: "Avg response time" }
               ].map((stat, i) => (
                 <div key={i} className="group flex flex-col gap-3">
                    <div className="text-3xl md:text-5xl font-normal font-valtero-serif italic text-white group-hover:text-[#00F0FF] transition-colors duration-500">
                      <Counter value={stat.val} />{stat.suffix}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30 group-hover:opacity-60 transition-opacity">
                      {stat.label}
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Visual (Image + Chat) */}
          <div className="relative group">
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group-hover:border-white/20 transition-all duration-700">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80"
                alt="Building digital products"
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
            </div>

            {/* Chat Overlay - More responsive positioning */}
            <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 space-y-3 md:space-y-4">
              {CHAT_MESSAGES.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.side === "right" ? 20 : -20, scale: 0.9 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ delay: msg.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl text-[10px] md:text-xs font-semibold backdrop-blur-xl ${
                    msg.side === "right" 
                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20" 
                    : "bg-white/10 text-white border-white/10"
                  } border shadow-2xl transition-transform hover:scale-105 cursor-default`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
