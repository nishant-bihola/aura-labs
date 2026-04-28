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
              Digital Residency Studio<br />
              Edmonton, Alberta
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
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] opacity-40 font-bold">The Journal</p>
            <NewsletterForm />
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

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "Newsletter", name: "Newsletter Subscriber", message: "Subscribed to journal" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={subscribe} className="relative w-full max-w-[320px] mx-auto md:ml-auto md:mr-0">
      <input 
        type="email" 
        required
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-24 py-3 text-[11px] md:text-xs focus:outline-none focus:border-white/30 transition-all placeholder:opacity-30 text-white"
      />
      <button 
        type="submit" 
        disabled={status === "loading"}
        className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-white text-black rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {status === "loading" ? "..." : (status === "success" ? "✓" : "Join")}
      </button>
      {status === "error" && <p className="text-[9px] text-red-500 mt-2 text-center md:text-left absolute -bottom-5 w-full">Error subscribing.</p>}
      {status === "success" && <p className="text-[9px] text-green-500 mt-2 text-center md:text-left absolute -bottom-5 w-full">Success!</p>}
    </form>
  );
}