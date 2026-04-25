import { motion } from "motion/react";

const LOGOS = [
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f21bd47a3ac4cdc061c8_logo-2.webp",
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f2685c21b0c333455273_logo-4.webp",
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f26859ddddd58b3e20ec_logo-1.webp",
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f26707e8506f3fed5637_logo-2.webp",
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f21bb04375536f9d1b1d_logo-1.webp",
  "https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6978f2678c71a600cbe4b679_logo-3.webp",
];

export default function LogoTicker() {
  return (
    <section className="py-20 border-x border-border-soft mx-6 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-24 px-12"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-24">
              {LOGOS.map((logo, idx) => (
                <img key={idx} src={logo} alt="Client" className="h-8 md:h-12 w-auto opacity-30 grayscale hover:opacity-100 transition-opacity duration-500" />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
