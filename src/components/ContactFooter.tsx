"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SOCIALS = [
  { name: "Instagram", href: "https://www.instagram.com/nishantbihola?igsh=cHE5bGZoa3kyanNr&utm_source=qr" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nishantsinh-bihola-8bb500321?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
];

export default function ContactFooter() {
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Edmonton",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat("en-GB", options);
      setTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="contact" className="pt-0 fluid-pb fluid-px border-x border-border-soft mx-3 md:mx-6 relative overflow-hidden bg-brand-bg">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-border-soft opacity-30" />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 mb-16 md:mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-valtero-sans opacity-40">Ready to start?</span>
          <div className="relative group overflow-hidden">
            <h2 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate('/contact#contact');
              }}
              className="text-[15vw] md:text-[18vw] font-valtero-serif italic leading-[0.8] tracking-tighter cursor-pointer transition-all duration-700 hover:scale-[1.02]"
            >
              <motion.span
                whileHover={{ y: -10 }}
                className="inline-block text-white"
              >
                Let's Talk
              </motion.span>
            </h2>
          </div>
          <div className="pt-8">
            <a href="mailto:Nishant15bihola@gmail.com" className="text-xl md:text-3xl font-valtero-serif italic opacity-60 hover:opacity-100 transition-opacity underline decoration-white/20 underline-offset-8">
              Nishant15bihola@gmail.com
            </a>
          </div>
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 pt-16 md:pt-24 border-t border-white/10 items-start">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="text-lg md:text-xl font-bold tracking-tighter uppercase font-sans">AURA LABS</div>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] opacity-40 leading-relaxed font-bold">
              Web Dev · AI Chatbots · Ad Content<br />
              Edmonton, Alberta · Worldwide
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-6 md:gap-8 pt-2 md:pt-0">
            {SOCIALS.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity">
                {s.name}
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate('/contact#contact');
              }}
              className="px-8 py-3 bg-white text-black rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all"
            >
              Start a Project
            </button>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-20 font-bold mt-2">Local Time: YEG {time}</p>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mt-20 md:mt-32 pt-8 border-t border-white/10 opacity-30 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold">
          <span className="text-center md:text-left leading-relaxed">© 2026 NISHANT BIHOLA.<br className="block md:hidden" /> ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
