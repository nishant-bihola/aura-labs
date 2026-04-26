export interface Project {
  id: string;
  slug: string;
  title: string;
  year: string;
  category: string;
  description: string;
  overview: string;
  challenges: string;
  results: string;
  client: string;
  services: string[];
  mainImage: string;
  galleryImages: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "01",
    slug: "zoro-arts",
    title: "Zoro Arts",
    year: "2026",
    category: "Branding",
    description: "A premium digital residency for modern art collectors and creators.",
    overview: "Zoro Arts bridges the gap between traditional fine art and the digital frontier. We created a brand identity that treats web space as a physical gallery, focusing on lighting, texture, and silence.",
    challenges: "The challenge was to maintain the prestige of high-end art while embracing digital accessibility. We needed a visual language that spoke to both seasoned collectors and digital natives.",
    results: "A cohesive brand ecosystem that increased collector engagement by 45% and established Zoro Arts as a leader in the digital art space.",
    client: "Zoro Arts Collective",
    services: ["Branding", "Web Design", "Digital Strategy"],
    mainImage: "/projects/zoro_arts_hero.png",
    galleryImages: [
      "/projects/zoro_arts_gallery_1777230740658.png",
      "/projects/forma_digital_images_1_1777230411890.png"
    ]
  },
  {
    id: "02",
    slug: "nero-vision",
    title: "Nero Vision",
    year: "2026",
    category: "AI Design",
    description: "Architecting the future of human-machine interface through cinematic UI.",
    overview: "Nero Vision is an AI research lab focused on neural interfaces. We were tasked with creating a visual dashboard that makes complex neural data feel intuitive, fluid, and high-performance.",
    challenges: "Visualizing invisible data streams. We utilized custom GLSL shaders and GSAP animations to create a 'living' interface that reacts to user focus and interaction.",
    results: "A revolutionary UI that reduced data processing friction for researchers by 30% and won the 'Digital Innovation' award for 2026.",
    client: "Nero Research Group",
    services: ["UI/UX Design", "Motion Systems", "WebGPU"],
    mainImage: "/projects/nero_vision_hero.png",
    galleryImages: [
      "/projects/forma_digital_images_2_1777230416451.png",
      "/projects/forma_digital_challenges_results_1777230365161.png"
    ]
  },
  {
    id: "03",
    slug: "vantablack",
    title: "Vantablack",
    year: "2025",
    category: "Architecture",
    description: "Extreme minimalism in digital and physical spatial design.",
    overview: "Vantablack Studio creates spaces that define the absence of light. Their digital presence needed to be an extension of their architecture—powerful, quiet, and profoundly precise.",
    challenges: "Creating a dark interface that felt 'deep' rather than empty. We leveraged grain textures, subtle lighting blooms, and ultra-slow scroll transitions.",
    results: "An immersive portfolio that secured three multi-million dollar contracts within the first month of launch by targeting high-net-worth investors.",
    client: "Vantablack Architecture",
    services: ["Creative Direction", "3D Web Design", "Branding"],
    mainImage: "/projects/vantablack_hero.png",
    galleryImages: [
      "/projects/forma_digital_overview_detail_1777230407453.png",
      "/projects/forma_digital_overview_challenges_1777230358286.png"
    ]
  },
  {
    id: "04",
    slug: "kanso-labs",
    title: "Kanso Labs",
    year: "2025",
    category: "Lifestyle",
    description: "Japanese-inspired simplicity for modern high-performance living.",
    overview: "Kanso focuses on 'Simplicity that eliminates clutter.' We developed a visual ecosystem that mirrors this philosophy—using whitespace as a primary design element.",
    challenges: "Finding the balance between 'minimalist' and 'premium.' We utilized high-end typography and micro-interactions to ensure the site felt luxury, not basic.",
    results: "A 55% increase in direct-to-consumer sales and a brand presence that redefined minimalist e-commerce design for 2025.",
    client: "Kanso Lifestyle Inc.",
    services: ["E-Commerce", "Art Direction", "Content Strategy"],
    mainImage: "/projects/kanso_labs_hero.png",
    galleryImages: [
      "/projects/kanso_design_hero_1777230786125.png",
      "/projects/forma_digital_footer_1777230388513.png"
    ]
  },
  {
    id: "05",
    slug: "apex-flow",
    title: "Apex Flow",
    year: "2026",
    category: "SaaS",
    description: "High-performance logistics built on clarity and speed.",
    overview: "Apex Flow is a supply-chain giant moving into the SaaS space. We built a brand that conveys reliability and forward momentum, focusing on speed and data clarity.",
    challenges: "Simplifying massive logistics data. We designed custom interactive 3D globes and real-time transit visualizations using Three.js.",
    results: "Onboarded 12 global shipping partners within 90 days and reduced user onboarding time by 40% through intuitive UI.",
    client: "Apex Logistics Group",
    services: ["SaaS Product Design", "3D Visualization", "Development"],
    mainImage: "/projects/apex_flow_hero.png",
    galleryImages: [
      "/projects/apex_digital_hero_1777230758408.png",
      "/projects/forma_digital_hero_1777230347053.png"
    ]
  }
];