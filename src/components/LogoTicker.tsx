import { motion } from "motion/react";

const STACK = [
  "React",
  "TypeScript",
  "Node.js",
  "Next.js",
  "Tailwind CSS",
  "Supabase",
  "Vercel",
  "Railway",
  "Framer Motion",
  "OpenAI API",
  "Resend",
  "Brevo",
];

const DOT = <span className="mx-10 opacity-20 text-2xl leading-none">·</span>;

export default function LogoTicker() {
  const items = [...STACK, ...STACK];

  return (
    <section className="py-16 border-x border-border-soft mx-6 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex items-center shrink-0"
        >
          {[...Array(3)].map((_, gi) => (
            <div key={gi} className="flex items-center">
              {items.map((name, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.25em] text-white/60 md:text-white/35 hover:text-white/80 transition-colors duration-300 cursor-default px-6">
                    {name}
                  </span>
                  {DOT}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
