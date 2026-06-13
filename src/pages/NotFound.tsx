import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Page Not Found | Aura Labs";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", "The requested protocol or page could not be located in our digital registry. Return to the main grid.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative px-6 overflow-hidden selection:bg-[#00f0ff] selection:text-black">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00f0ff]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#bd00ff]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 text-center max-w-lg space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 justify-center opacity-40">
            <span className="w-8 h-[1px] bg-white"></span>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)]">Error Code 404</span>
          </div>
          
          <h1 className="text-8xl md:text-9xl font-bold font-valtero-serif italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30">
            404
          </h1>
          
          <h2 className="text-xl md:text-2xl font-serif italic text-white/80 font-light mt-4">
            Registry Entry Not Found
          </h2>
          
          <p className="text-white/45 text-sm font-light leading-relaxed max-w-sm mx-auto">
            The coordinate path you entered does not exist or has been shifted in the digital matrix.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <Link
            to="/"
            className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#00f0ff] hover:scale-105 active:scale-98 transition-all duration-300 shadow-xl focus-visible:ring-2 focus-visible:ring-[#00f0ff] focus-visible:outline-none"
          >
            <Home size={14} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            Return to Grid
          </Link>
        </motion.div>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute bottom-10 inset-x-6 flex justify-between items-center text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-20 pointer-events-none">
        <span>Aura Labs Network</span>
        <span>Edmonton, Alberta</span>
      </div>
    </div>
  );
}
