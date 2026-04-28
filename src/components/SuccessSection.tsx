import { motion } from "motion/react";
import Counter from "./Counter";

const CHAT_MESSAGES = [
  { text: "Hey hey!", side: "left", delay: 0.5 },
  { text: "Love the designs 💚", side: "left", delay: 1.2 },
  { text: "Can we tweak the hero?", side: "left", delay: 2.0 },
  { text: "Sure", side: "right", delay: 3.0, color: "bg-accent-green" },
  { text: "We'll update it shortly", side: "right", delay: 3.5, color: "bg-accent-green" },
  { text: "Perfect!", side: "left", delay: 4.5 },
];

export default function SuccessSection() {
  return (
    <section className="fluid-py fluid-px border-x border-border-soft mx-3 md:mx-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="fluid-h2 font-normal font-valtero-serif italic leading-[0.9] tracking-tighter">
              Built for your success.
            </h2>
            <p className="text-xl font-light opacity-60 max-w-md">
              From idea to launch, we move fast and stay personal — every detail, every step.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12">
               {[
                 { val: 67, suffix: "+", label: "Projects completed" },
                 { val: 42, suffix: "+", label: "Global Clients" },
                 { val: 12, suffix: "%", label: "Conversion increase" }
               ].map((stat, i) => (
                 <div key={i} className="space-y-2">
                    <div className="text-2xl md:text-4xl font-normal font-valtero-serif italic">
                      <Counter value={stat.val} />{stat.suffix}
                    </div>
                    <div className="text-[9px] md:text-[10px] uppercase kerning-wide font-bold opacity-40">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="relative group">
            <div className="aspect-[4/5] rounded-sm overflow-hidden mb-12">
              <img 
                src="https://cdn.prod.website-files.com/697344b93b0e03014bb98903/697946b71c91bd8ad83419a1_Group-Discussion-Scene.webp" 
                alt="Our process" 
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" 
              />
            </div>

            {/* Chat Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs space-y-4">
              {CHAT_MESSAGES.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: msg.delay, type: "spring", stiffness: 100 }}
                  className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`px-4 py-3 rounded-2xl text-xs font-medium ${msg.color || "bg-white/10 backdrop-blur-md"} border border-white/5 shadow-2xl`}>
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
