import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ChevronDown, Code, Zap, Globe, Cpu } from "lucide-react";
import { useEffect } from "react";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Spotlight effect tracking cursor
  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0, 240, 255, 0.15), transparent 80%)`;

  return (
    <section className="relative h-screen bg-black flex flex-col items-center justify-center overflow-hidden border-x border-white/5 mx-3 md:mx-6 group">
      
      {/* 1. Animated Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60 mix-blend-screen scale-105"
        >
          {/* New High-Energy Dribbble Video */}
          <source src="https://cdn.dribbble.com/userupload/47884462/file/382a205af640e8020710b90fc6415744.mp4" type="video/mp4" />
        </video>
        {/* Deep cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
      </div>

      {/* 2. Interactive Spotlight Gradient */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"
        style={{ background }}
      />

      {/* 3. Subtle Animated Grain Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Floating Abstract Tech Orbs */}
      <motion.div 
        animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-[60px] pointer-events-none"
      />
      <motion.div 
        animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"
      />

      {/* Floating Badges */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-[30%] left-[5%] md:left-[15%] hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
      >
        <Code size={14} className="text-[#00f0ff]" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">React & Node</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute top-[40%] right-[5%] md:right-[15%] hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
      >
        <Zap size={14} className="text-[#00f0ff]" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">Generative AI</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-[30%] left-[10%] hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
      >
        <Cpu size={14} className="text-[#00f0ff]" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">SaaS Systems</span>
      </motion.div>


      {/* Corner Labels */}
      <div className="absolute bottom-6 left-6 md:left-8 flex flex-col gap-1 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 md:opacity-60 z-20">
        <span>Web Development</span>
        <span>AI Chatbots</span>
        <span>AI Ad Content</span>
        <span>Web Apps</span>
      </div>

      <div className="absolute bottom-6 right-6 md:right-8 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 md:opacity-60 z-20">
        Featured Work /03
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
        <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.3em] text-[#00f0ff] opacity-80 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">Explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={12} className="text-[#00f0ff] opacity-80" />
        </motion.div>
      </div>

      {/* Huge Centered Text */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="relative w-full"
        >
          <h1 className="fluid-h1 leading-[0.75] font-black uppercase font-display tracking-tighter text-white flex flex-wrap items-center justify-center relative">
            
            {/* Glowing Backdrop Text */}
            <span className="absolute inset-0 blur-[40px] text-[#00f0ff]/30 mix-blend-screen pointer-events-none select-none" aria-hidden="true">
              AURA LABS
            </span>

            {"AURA LABS".split("").map((char, i) => (
              char === " " ? (
                <span key={i} className="w-[3vw]">&nbsp;</span>
              ) : (
                <motion.span
                  key={i}
                  className="inline-block origin-bottom relative drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: i * 0.05, 
                    type: "spring", 
                    damping: 12 
                  }}
                  whileHover={{ 
                    scaleY: 1.2, 
                    scaleX: 0.9,
                    y: -15,
                    color: "#00f0ff",
                    textShadow: "0 0 30px rgba(0,240,255,0.8)"
                  }}
                >
                  {char}
                </motion.span>
              )
            ))}
            
            <motion.span 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
              className="inline-flex items-center justify-center ml-[2vw] relative group"
            >
               <motion.div 
                 whileHover={{ rotate: 180, scale: 1.1, boxShadow: "0 0 40px rgba(0,240,255,0.4)" }}
                 transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                 className="w-[12vw] h-[12vw] md:w-[10vw] md:h-[10vw] border-[0.4vw] border-white/20 rounded-full flex items-center justify-center relative cursor-pointer overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/10 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]"
               >
                  <div className="w-[7vw] h-[7vw] md:w-[6vw] md:h-[6vw] border-[0.2vw] border-[#00f0ff]/50 rounded-full flex items-center justify-center select-none shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                     <motion.span 
                        className="text-[3.5vw] md:text-[3vw] leading-none text-[#00f0ff] font-serif italic"
                        whileHover={{ scale: 1.2 }}
                     >
                       <Globe strokeWidth={1.5} className="w-full h-full p-[1vw]" />
                     </motion.span>
                  </div>
               </motion.div>
            </motion.span>
          </h1>
        </motion.div>
        
        <div className="max-w-[280px] md:max-w-xl mt-12 md:mt-16">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-[10px] md:text-xs uppercase font-bold leading-relaxed text-center text-white/50 tracking-[0.3em]"
            >
              Architecting the <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">digital future</span> with high-performance <br className="hidden md:block" />
              SaaS, AI, and enterprise interfaces.
            </motion.p>
        </div>
      </div>
    </section>
  );
}
