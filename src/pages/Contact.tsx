import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Calendar, Mail, Check, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    date: "",
    time: ""
  });

  const handleBookingSubmit = async () => {
    if (!bookingData.date || !bookingData.time || !bookingData.firstName || !bookingData.email) return;
    
    setBookingStatus("loading");
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          timeZone
        }),
      });

      if (response.ok) {
        setBookingStatus("success");
      } else {
        const errData = await response.json();
        console.error("Booking failed:", errData);
        setBookingStatus("error");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setBookingStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          message: formData.message,
          plan: selectedPlan || "Custom",
          type: selectedPlan === "Project" ? "Project Inquiry" : (selectedPlan ? "Pricing Lead" : "Contact"),
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
        // Scroll to top after successful submission
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setStatus("error");
      }
    } catch (error) {
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
            font-size: clamp(4rem, 14vw, 11rem);
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
      <section ref={heroRef} className="relative pt-32 md:pt-48 pb-20 fluid-px border-b border-white/5 mx-3 md:mx-6 border-x border-white/5">
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
          
          <h1 className="fluid-h1 font-serif italic tracking-tighter mb-8 md:mb-12">
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
                        <p className="opacity-40 text-xs md:text-sm">Expect a response within one business day.</p>
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
                          <label className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">First Name</label>
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
                          <label className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">Last Name</label>
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
                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">Email Address</label>
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
                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 ml-1">Message</label>
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
                          {status === "loading" ? "Processing..." : "Submit Inquiry"}
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
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 md:gap-20 mb-16 md:mb-24">
            <div className="max-w-2xl">
               <h2 className="text-3xl md:text-7xl font-serif italic mb-8 leading-[0.9] tracking-tighter">Secure a <br /> Private Consultation.</h2>
               <p className="text-white/30 text-base md:text-xl font-light leading-relaxed">
                 Bypass the queue. Choose a time for a 1:1 strategy session with our lead architects. No friction, just focus.
               </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full lg:w-auto">
               <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[240px]">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 mb-1">Method</p>
                    <p className="text-xs font-medium">Virtual • Google Meet</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Calendar */}
            <div className="bg-white/[0.02] rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-white/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg md:text-xl font-serif italic">Select Date</h3>
                <div className="text-[9px] uppercase tracking-widest opacity-20">May 2026</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-4 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[8px] font-bold opacity-20 py-2">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(2026, 4, day); // May is index 4
                  const dayOfWeek = dateObj.getDay();
                  // Enable all days for booking
                  const isSelectable = true;
                  const isSelected = bookingData.date === `2026-05-${day.toString().padStart(2, '0')}`;
                  
                  return (
                    <button
                      key={i}
                      disabled={!isSelectable}
                      onClick={() => setBookingData({...bookingData, date: `2026-05-${day.toString().padStart(2, '0')}`})}
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-[10px] sm:text-sm transition-all duration-500
                        ${isSelected ? 'bg-white text-black font-bold scale-110' : ''}
                        ${!isSelectable ? 'opacity-5 pointer-events-none' : 'hover:bg-white/10 opacity-60'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details & Confirmation */}
            <div className="bg-white/[0.02] rounded-[32px] md:rounded-[40px] p-8 md:p-12 border border-white/5 flex flex-col justify-between">
              {bookingStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-grow flex flex-col items-center justify-center text-center space-y-6 py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    <Check size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif italic mb-2">Call Secured</h3>
                    <p className="text-white/60 text-sm mb-2">{bookingData.date} at {bookingData.time}</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-6">Mountain Time (Edmonton)</p>
                    <p className="text-xs text-white/30 max-w-[240px] mx-auto">Confirmation and calendar invitation sent to {bookingData.email}.</p>
                  </div>
                  <button 
                    onClick={() => setBookingStatus("idle")}
                    className="text-[9px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-all"
                  >
                    Reschedule
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-lg md:text-xl font-serif italic">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <input 
                        type="text" 
                        placeholder="First Name"
                        value={bookingData.firstName}
                        onChange={(e) => setBookingData({...bookingData, firstName: e.target.value})}
                        className="bg-transparent border-b border-white/10 py-2 text-xs sm:text-sm focus:outline-none focus:border-white transition-all placeholder:opacity-20"
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name"
                        value={bookingData.lastName}
                        onChange={(e) => setBookingData({...bookingData, lastName: e.target.value})}
                        className="bg-transparent border-b border-white/10 py-2 text-xs sm:text-sm focus:outline-none focus:border-white transition-all placeholder:opacity-20"
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                        className="bg-transparent border-b border-white/10 py-2 text-xs sm:text-sm focus:outline-none focus:border-white transition-all placeholder:opacity-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg md:text-xl font-serif italic">Select Slot</h3>
                      <p className="text-[8px] opacity-20 uppercase tracking-widest">Timezone: Edmonton (MST/MDT)</p>
                    </div>
                    
                    {bookingData.date ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                          '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                          '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
                        ].map(t => (
                          <button
                            key={t}
                            onClick={() => setBookingData({...bookingData, time: t})}
                            className={`
                              py-3 rounded-xl border text-[10px] font-bold tracking-widest transition-all duration-500
                              ${bookingData.time === t ? 'bg-white border-white text-black' : 'border-white/10 hover:border-white/30 text-white/40 hover:text-white'}
                            `}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                        <p className="text-[10px] uppercase tracking-widest opacity-20 italic">Select a date first</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={!bookingData.date || !bookingData.time || !bookingData.firstName || !bookingData.email || bookingStatus === "loading"}
                      onClick={handleBookingSubmit}
                      className="valtero-btn w-full"
                    >
                      {bookingStatus === "loading" ? "Confirming..." : "Confirm Booking"}
                    </button>
                    {bookingStatus === "error" && (
                      <p className="text-[9px] text-red-500 mt-4 text-center">Connection failed. Please retry.</p>
                    )}
                  </div>
                </div>
              )}
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
