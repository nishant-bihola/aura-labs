import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Calendar, Mail, Check, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { submitServiceRequest } from "../api/bookingApi";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedPlan = queryParams.get("plan");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await submitServiceRequest({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: formData.message,
        plan: selectedPlan || "Custom",
        serviceType: selectedPlan === "Project" ? "Project Inquiry" : (selectedPlan ? "Pricing Lead" : "Contact"),
        timestamp: new Date().toISOString(),
        source: 'Website Form'
      });

      setStatus("success");
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      // Scroll to top after successful submission
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Submission failed:", error);
      setStatus("error");
    }
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start center", "end start"]
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [0.1, 1]);
  const textFillWidth = useTransform(scrollYProgress, [0, 0.4], ["0%", "100%"]);

  return (
    <div className="bg-brand-bg text-white min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <style>{`
        .text-outline {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
        .fluid-h1-contact {
          font-size: clamp(2.2rem, 10vw, 11rem);
          line-height: 0.85;
          letter-spacing: -0.04em;
        }
        @media (min-width: 768px) {
          .fluid-h1-contact {
            font-size: clamp(4rem, 11vw, 11rem);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .valtero-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #000000;
          border-radius: 100px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 9px;
          padding: 14px 28px;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .valtero-btn:hover {
          transform: scale(0.98);
          background: #f0f0f0;
        }
        .valtero-btn:active {
          transform: scale(0.95);
        }
        .valtero-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.05);
          transform: translateY(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .valtero-btn:hover::after {
          transform: translateY(0);
        }
      `}</style>

      {/* 1. CINEMATIC HERO SECTION */}
      <section id="contact" ref={heroRef} className="relative pt-32 md:pt-48 pb-20 fluid-px border-b border-white/5 mx-3 md:mx-6 border-x border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-8 opacity-40">
            <span className="w-8 h-[1px] bg-white"></span>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Connect</span>
          </div>
          
          <h1 className="fluid-h1-contact font-serif italic tracking-tighter mb-8 md:mb-12">
            Let's build <br className="hidden md:block" /> something <br className="md:hidden" />
            <span className="relative inline-block">
              <span className="text-outline opacity-20 italic">Extraordinary.</span>
              <motion.span 
                style={{ width: textFillWidth }}
                className="absolute top-0 left-0 overflow-hidden whitespace-nowrap text-white italic"
              >
                Extraordinary.
              </motion.span>
            </span>
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start mt-12 md:mt-20">
            {/* Left Column: Brief & Socials */}
            <div className="lg:col-span-5 space-y-12">
               <p className="text-lg md:text-2xl text-white/40 leading-relaxed font-light max-w-md">
                 Our studio architects are ready to translate your vision into a digital masterpiece.
               </p>
               <div className="space-y-8">
                  <div className="group">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-20 mb-2">Global HQ</p>
                     <p className="text-sm md:text-base text-white/60">Edmonton, Alberta</p>
                  </div>
                  <div className="group">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-20 mb-2">Email</p>
                     <a href="mailto:Nishant15bihola@gmail.com" className="text-base md:text-xl hover:text-white/60 transition-colors flex items-center gap-2">
                        Nishant15bihola@gmail.com <ArrowUpRight size={16} />
                     </a>
                  </div>
               </div>
            </div>

            {/* Right Column: The Form */}
            <div className="lg:col-span-7 w-full">
              <div className="bg-white/[0.02] p-8 md:p-14 rounded-[32px] md:rounded-[48px] border border-white/5 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-10 md:py-20 text-center space-y-6"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                        <Check size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-serif italic mb-2">Transmission Received</h3>
                        <p className="opacity-40 text-xs md:text-sm">Check your inbox for a secure confirmation transmission.</p>
                      </div>
                      <button 
                        onClick={() => setStatus("idle")}
                        className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity"
                      >
                        Start New Inquiry
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8 md:space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <div className="space-y-3">
                          <label className="text-[12px] uppercase tracking-[0.2em] font-bold opacity-60 ml-1">First Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white transition-all duration-500 placeholder:opacity-20"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[12px] uppercase tracking-[0.2em] font-bold opacity-60 ml-1">Last Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white transition-all duration-500 placeholder:opacity-20"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[12px] uppercase tracking-[0.2em] font-bold opacity-60 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white transition-all duration-500 placeholder:opacity-20"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[12px] uppercase tracking-[0.2em] font-bold opacity-60 ml-1">Message</label>
                        <textarea 
                          rows={3}
                          required
                          placeholder="Project details..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-white transition-all duration-500 resize-none placeholder:opacity-20"
                        />
                      </div>

                      <div className="pt-4 flex justify-start">
                        <button 
                          type="submit"
                          disabled={status === "loading"}
                          className="valtero-btn"
                        >
                          {status === "loading" ? "Sending..." : "Submit Inquiry"}
                        </button>
                      </div>
                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. BOOKING SECTION */}
      <section className="fluid-py fluid-px bg-black border-t border-white/5 mx-3 md:mx-6 border-x border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 md:gap-20 text-center lg:text-left">
            <div className="max-w-2xl">
               <div className="flex items-center gap-2 mb-6 opacity-40 justify-center lg:justify-start">
                 <span className="w-8 h-[1px] bg-white"></span>
                 <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Scheduling</span>
               </div>
               <h2 className="text-3xl md:text-7xl font-serif italic mb-8 leading-[0.9] tracking-tighter">Secure a <br /> Private Consultation.</h2>
               <p className="text-white/30 text-base md:text-xl font-light leading-relaxed mb-8">
                 Bypass the queue. Synchronize with our lead architects via our secure appointment gateway. 1:1 focus, zero friction.
               </p>
               <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                 <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold">
                    <Video size={14} className="text-blue-400" />
                    <span>Google Meet</span>
                 </div>
                 <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold">
                    <Calendar size={14} className="text-green-400" />
                    <span>30-60 Min Session</span>
                 </div>
               </div>
            </div>

            <div className="w-full lg:w-[400px] flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/[0.02] p-8 md:p-12 rounded-[32px] md:rounded-[40px] border border-white/10 flex flex-col items-center justify-center space-y-6 md:space-y-8 backdrop-blur-md"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar size={28} strokeWidth={1.5} className="md:w-8 md:h-8" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl md:text-3xl font-serif italic text-white">Live Availability</h3>
                  <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Mountain Time (Edmonton)</p>
                </div>
                <div className="w-full flex justify-center pt-2">
                  <a 
                    href="https://calendar.app.google/ZQNXkk3AFDSdbyReA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="valtero-btn whitespace-nowrap !text-[10px] md:!text-xs !px-8 md:!px-10 !py-4 md:!py-5 w-full sm:w-auto text-center"
                  >
                    Schedule Strategy Session
                  </a>
                </div>
                <p className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.2em] text-center max-w-[200px]">Instant Confirmation Guaranteed</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA Area */}
      <section className="py-32 md:py-60 fluid-px bg-black text-white text-center border-t border-white/5 overflow-hidden mx-3 md:mx-6 border-x border-white/5">
          <motion.p 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2 }}
            className="fluid-h1 font-serif italic tracking-tighter leading-none max-w-6xl mx-auto"
          >
            Evolution starts <br className="hidden md:block" /> with a conversation.
          </motion.p>
      </section>
    </div>
  );
}
