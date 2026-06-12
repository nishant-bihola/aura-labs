export const CMS_DATA = {
  company: {
    name: "Aura Labs",
    location: "Edmonton, Alberta",
    tagline: "Building digital realities and hyper-intelligent systems.",
    mission: "Transitioning businesses from static brochures to scalable SaaS and AI-driven platforms.",
  },
  services: [
    {
      id: "ai-chatbots",
      title: "AI Chatbots & Agents",
      price: "$99/mo (Add-on) or custom pricing",
      description: "24/7 automated customer support and lead generation powered by advanced LLMs.",
      features: [
        "24/7 Automated Customer Support",
        "Lead Capture & Qualification",
        "Custom Knowledge Base Integration",
        "Seamless Website Handoff",
        "Multi-language Support"
      ]
    },
    {
      id: "ai-ads",
      title: "AI Ad Content",
      price: "Starts at $800/campaign",
      description: "Premium motion ads and product imagery powered by generative AI.",
      features: [
        "15-second Motion Video Ads",
        "Generative AI Product Imagery",
        "High-converting Scripts & Storyboards",
        "Platform-Optimized Formats (IG, TikTok)",
        "Rapid 24-48 Hour Delivery"
      ]
    },
    {
      id: "web-development",
      title: "Web Development",
      price: "Custom Pricing based on scope",
      description: "High-performance websites and React/Node.js web applications tailored for conversion.",
      features: [
        "Custom React/Node.js Architecture",
        "Lighting Fast Load Speeds",
        "Mobile & Screen Optimized",
        "Headless CMS Integration",
        "Technical SEO & Analytics"
      ]
    },
    {
      id: "brand-identity",
      title: "Brand Identity",
      price: "Custom Pricing",
      description: "Complete visual overhauls including logo design, typography, and cinematic aesthetics.",
      features: [
        "Primary and Secondary Logo Design",
        "Typography & Color Systems",
        "Brand Guidelines Document",
        "Social Media Kits",
        "Cinematic Motion Graphics"
      ]
    }
  ],
  pricing_plans: [
    {
      name: "Starter",
      description: "Perfect for establishing a premium digital presence.",
      features: ["Custom Landing Page", "Mobile Optimization", "Basic SEO Setup", "Contact Form Integration"],
      recommended: false
    },
    {
      name: "Growth",
      description: "Comprehensive web presence with AI capabilities.",
      features: ["Up to 5 Pages", "Advanced SEO Optimization", "Basic AI Chatbot Integration", "CMS Setup (Sanity)", "Analytics Dashboard"],
      recommended: true
    },
    {
      name: "Enterprise",
      description: "Full-scale digital transformation and custom software.",
      features: ["Unlimited Pages", "Custom Web App Features", "Advanced RAG Chatbot", "Priority 24/7 Support", "Performance Guarantee"],
      recommended: false
    }
  ],
  instructions_for_ai: "You are Aura AI. You must quote the pricing accurately from the services array or pricing_plans array above. Always push users to book a consultation or leave their email. When they leave an email, use the [CAPTURE_LEAD: ...] exact syntax."
};
