import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get("plan");
  const projectName = searchParams.get("name");

  // Auto-fill message if project context exists
  useState(() => {
    if (projectName) {
      setFormData(prev => ({
        ...prev,
        message: `I'm interested in a project similar to ${projectName}. I'd love to discuss how we can achieve similar results for my brand.`
      }));
    } else if (selectedPlan) {
       setFormData(prev => ({
        ...prev,
        message: `I'm interested in the ${selectedPlan} plan. Please send over more details on how we can get started.`
      }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    let inquiryType: "Contact" | "Pricing Lead" | "Project Inquiry" = "Contact";
    if (selectedPlan === "Project") inquiryType = "Project Inquiry";
    else if (selectedPlan) inquiryType = "Pricing Lead";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          message: formData.message,
          plan: selectedPlan || "Custom",
          type: inquiryType,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="bg-brand-bg text-white min-h-screen font-sans selection:bg-white selection:text-black">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative pt-32 md:pt-48 pb-20 fluid-px border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-8 opacity-40">
            <span className="w-8 h-[1px] bg-white"></span>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Contact</span>
          </div>
          <h1 className="fluid-h1 font-serif italic leading-[0.8] tracking-tighter mb-12">
            Let's build something <br />
            <span className="text-outline opacity-40">Extraordinary.</span>
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-start mt-20">
            {/* Left Column: Brief & Socials */}
            <div className="space-y-12">
               <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light max-w-md">
                 Whether you have a fully-formed idea or just a spark, we're here to help you navigate the digital landscape.
               </p>
               <div className="flex flex-col gap-6">
                  <div className="space-y-1">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Inquiries</p>
                     <a href="mailto:hello@auralabs.io" className="text-lg md:text-xl hover:opacity-60 transition-opacity flex items-center gap-2">
                        hello@auralabs.io <ArrowUpRight size={16} />
                     </a>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Follow Us</p>
                     <div className="flex gap-6">
                        {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
                          <a key={social} href="#" className="text-sm md:text-base border-b border-white/10 hover:border-white transition-all py-1">{social}</a>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: The Form */}
            <div className="w-full">
              <div className="bg-white/5 p-8 md:p-12 rounded-[40px] border border-white/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-all duration-1000" />
                
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                        <Check size={40} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif italic mb-2">Message Sent</h3>
                        <p className="opacity-60 text-sm">We'll get back to you within 24 hours.</p>
                      </div>
                      <button 
                        onClick={() => setStatus("idle")}
                        className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">First Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">Last Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-4">Message</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Tell us about your project..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition-all duration-300 resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-6 bg-white text-black rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-[0.98] active:scale-[0.95] transition-all disabled:opacity-50"
                      >
                        {status === "loading" ? "Sending..." : "Submit Inquiry"}
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. TESTIMONIAL SECTION (Marco Domani Style) */}
      <section className="fluid-py fluid-px bg-white text-black relative overflow-hidden">
        {/* Large Decorative Quote Mark */}
        <div className="absolute top-10 left-10 text-[20vw] font-serif italic opacity-[0.03] select-none pointer-events-none">“</div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-serif italic leading-[1.1] mb-16 tracking-tight balance-text">
              "Aura Labs doesn't just build websites; they architect digital experiences that feel alive. Their attention to interaction and motion is unmatched."
            </blockquote>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border-2 border-black/5 p-1">
                <img 
                  src="https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973f0d15764f9b537dbd3c6_Scene%208.webp" 
                  alt="Marco Domani" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold uppercase tracking-widest">Marco Domani</h4>
                <p className="text-xs opacity-60 uppercase tracking-widest mt-1">Founder, Webflow</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. BOOKING SECTION */}
      <section className="fluid-py fluid-px border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
             <h2 className="fluid-h2 font-serif italic mb-8 leading-tight">Prefer a face-to-face <br /> consultation?</h2>
             <p className="text-white/40 text-lg md:text-xl max-w-xl font-light leading-relaxed">
               Book a 15-minute discovery call directly via Google Meet. We'll discuss your vision, timeline, and how we can bring your brand to life.
             </p>
          </div>
          <div className="lg:col-span-5">
             <div className="p-8 md:p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <Calendar size={80} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Discovery Call</h3>
                <div className="space-y-4 mb-10">
                   <div className="flex items-center gap-3 text-white/60">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-sm font-medium">Available this week</span>
                   </div>
                   <div className="text-white/40 text-sm">15-30 Minutes • Google Meet</div>
                </div>
                <a 
                  href="https://calendar.google.com/calendar/u/0/appointments/schedules/YOUR_GOOGLE_CALENDAR_LINK" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-5 bg-white text-black rounded-full text-center text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors active:scale-95"
                >
                   Book via Google Meet
                </a>
             </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA Area */}
      <section className="py-24 md:py-48 px-4 md:px-12 bg-black text-white text-center border-t border-white/5 overflow-hidden">
          <motion.p 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="text-4xl md:text-8xl font-serif italic tracking-tighter leading-none max-w-5xl mx-auto"
          >
            Let's build something <br /> extraordinary together.
          </motion.p>
      </section>
    </div>
  );
}
