"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SOCIALS = [
  { name: "Instagram", href: "#" },
  { name: "LinkedIn", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Dribbble", href: "#" },
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
      // Edmonton is MST (UTC-7) or MDT (UTC-6)
      const formatter = new Intl.DateTimeFormat("en-GB", options);
      setTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="contact" className="py-24 md:py-32 px-4 md:px-6 border-x border-border-soft mx-4 md:mx-6 relative overflow-hidden bg-brand-bg">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-border-soft opacity-30" />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 mb-16 md:mb-24"
        >
          <span className="text-[10px] uppercase kerning-wide font-bold opacity-40">Ready to start?</span>
          <h2 
            onClick={() => navigate('/contact')}
            className="text-6xl md:text-[14vw] font-normal leading-none tracking-tighter serif italic group cursor-pointer overflow-hidden pb-4"
          >
            <motion.span
              whileHover={{ y: -5 }}
              className="inline-block"
            >
              Let's Talk
            </motion.span>
          </h2>
          <a href="mailto:hello@auralabs.io" className="text-xl md:text-3xl font-light opacity-60 hover:opacity-100 transition-opacity underline decoration-brand-text/20 underline-offset-12">
            hello@auralabs.io
          </a>
        </motion.div>

        <div className="w-full grid md:grid-cols-3 gap-12 pt-24 border-t border-border-soft items-start">
          <div className="text-left space-y-4">
            <div className="text-lg font-semibold tracking-tighter">AURA LABS</div>
            <p className="text-[10px] uppercase kerning-wide opacity-40 leading-relaxed font-bold">
              Digital Residency Studio<br />
              Berlin — Tokyo — NY
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-8">
            {SOCIALS.map(s => (
              <a key={s.name} href={s.href} className="text-[10px] uppercase kerning-wide font-bold opacity-40 hover:opacity-100 transition-opacity">
                {s.name}
              </a>
            ))}
          </div>

          <div className="md:text-right space-y-2">
            <p className="text-[10px] uppercase kerning-wide opacity-40 font-bold">Local Time</p>
            <p className="text-sm font-medium tracking-tight">YEG {time} (UTC-6)</p>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-32 pt-8 border-t border-border-soft opacity-20 text-[9px] uppercase kerning-wide font-bold">
          <span>© 2026 AURA LABS — ALL RIGHTS RESERVED</span>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};