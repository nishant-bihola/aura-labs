import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const planParam = queryParams.get("plan") || "Custom Package";

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    projectDetails: "",
  });
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { 
        styles: { branding: { brandColor: "#00f0ff" } }, 
        hideEventTypeDetails: false, 
        layout: "month_view",
        theme: "dark"
      });
    })();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; message?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.projectDetails.length < 10) {
      newErrors.message = "Please provide a bit more detail about your project.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          plan: planParam,
          projectDetails: formData.projectDetails
        })
      });

      if (!response.ok) throw new Error("Checkout failed");
      
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans pt-24 md:pt-32 pb-20 fluid-px selection:bg-[#00f0ff] selection:text-black">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 md:mb-12 text-sm uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20"
            >
              {/* Left Column: Order Summary */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif italic mb-4">Secure Checkout.</h1>
                  <p className="text-white/40 text-sm leading-relaxed">
                    You are initiating an e-Transfer checkout for <strong className="text-white">{planParam}</strong>. 
                    No credit card required. Payment instructions will be sent directly to your email.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Order Summary</h3>
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <span className="text-lg font-serif italic">{planParam}</span>
                    <span className="text-[#00f0ff] font-bold">—</span>
                  </div>
                  <ul className="space-y-4 text-sm text-white/60">
                    <li className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-[#00f0ff]" /> Encrypted Data Transfer
                    </li>
                    <li className="flex items-center gap-3">
                      <Check size={16} className="text-[#00f0ff]" /> Zero Processing Fees
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Details Form */}
              <div className="lg:col-span-7">
                <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12">
                  <h2 className="text-2xl font-serif italic mb-8">Client Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">First Name</label>
                        <input 
                          type="text" required placeholder="John"
                          value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors placeholder:opacity-20"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Last Name</label>
                        <input 
                          type="text" required placeholder="Doe"
                          value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-3 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors placeholder:opacity-20"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Email Address</label>
                      <input 
                        type="email" required placeholder="john@example.com"
                        value={formData.email} onChange={e => {
                          setFormData({...formData, email: e.target.value});
                          if (errors.email) setErrors({...errors, email: undefined});
                        }}
                        className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-white/10'} py-3 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors placeholder:opacity-20`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Project Brief</label>
                      <textarea 
                        required rows={3} placeholder="Briefly describe what we are building..."
                        value={formData.projectDetails} onChange={e => {
                          setFormData({...formData, projectDetails: e.target.value});
                          if (errors.message) setErrors({...errors, message: undefined});
                        }}
                        className={`w-full bg-transparent border-b ${errors.message ? 'border-red-500' : 'border-white/10'} py-3 text-sm focus:outline-none focus:border-[#00f0ff] transition-colors resize-none placeholder:opacity-20`}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>

                    <button 
                      type="submit" disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#00f0ff] to-[#0055ff] text-white py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Processing..." : "Request Payment Instructions"}
                      {!isSubmitting && <ArrowRight size={14} />}
                    </button>
                    <p className="text-center text-white/30 text-[9px] uppercase tracking-widest mt-4">By proceeding, you agree to our terms of service.</p>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {/* Payment Instructions Header */}
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-full flex items-center justify-center mx-auto text-[#00f0ff]">
                  <Mail size={24} />
                </div>
                <h2 className="text-4xl md:text-5xl font-serif italic">Check your inbox.</h2>
                <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
                  We've sent the e-Transfer instructions to <strong className="text-white">{formData.email}</strong>. 
                  Please send the payment to <strong className="text-[#00f0ff]">Nishant15bihola@gmail.com</strong>.
                </p>
              </div>

              {/* Cal.com Embed */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-2 md:p-8 overflow-hidden relative">
                <div className="text-center mb-8 pt-6">
                  <h3 className="text-2xl font-serif italic mb-2">Book Your Kickoff Call</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Schedule your 1-on-1 session below</p>
                </div>
                
                {/* CAL.COM IFRAME WRAPPER */}
                <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-black/50">
                  <Cal 
                    calLink="nishant-bihola-aura-lab/15min" 
                    style={{width:"100%",height:"100%",overflow:"scroll"}}
                    config={{layout: 'month_view'}}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
