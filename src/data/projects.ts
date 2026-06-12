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
  liveUrl?: string;
  mainImage: string;
  thumbImage: string;
  galleryImages: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "01",
    slug: "bud-n-buddies",
    title: "Bud n' Buddies",
    year: "2026",
    category: "Web App",
    description: "Full-stack cannabis ordering platform with real-time inventory, memberships, and custom product requests.",
    overview: "Bud n' Buddies is a cannabis shop focused on convenience and value — price-matching within 25km and fulfilling custom product requests beyond standard inventory. We built their full-stack web platform handling online ordering, membership management, and a custom request portal from the ground up.",
    challenges: "Building a compliant, conversion-ready ordering experience in a regulated industry. We implemented real-time product availability, a price-match tracking system, and a custom request pipeline — all behind a clean, intuitive UI that works seamlessly on mobile.",
    results: "A live, fully operational platform that handles orders, memberships, and custom product requests — turning the brand's 'convenience and value' promise into a real digital product serving customers in Sherwood Park, AB.",
    client: "Bud n' Buddies Cannabis",
    services: ["Full-Stack Development", "React", "Node.js", "E-Commerce"],
    liveUrl: "https://profound-nourishment-production-0662.up.railway.app/",
    mainImage: "/projects/bud-n-buddies-hero.jpg",
    thumbImage: "/projects/bud-n-buddies-thumb.jpg",
    galleryImages: [
      "/projects/bud-n-buddies-detail.jpg",
      "/projects/bud-n-buddies-hero.jpg"
    ]
  },
  {
    id: "02",
    slug: "apex-towing",
    title: "Apex Towing",
    year: "2026",
    category: "Web Design",
    description: "High-converting emergency towing service website built for speed, trust, and mobile-first lead generation.",
    overview: "Apex Towing operates 24/7 and needed a website that converts under pressure — when a driver is stranded, every second of friction costs a booking. We designed and built a mobile-first site with prominent emergency CTAs, instant quote requests, and a service area layout built to capture local search traffic.",
    challenges: "Emergency service sites have a unique UX constraint: users are stressed, often on mobile, and need one-handed access to a phone number or booking form within seconds. We stripped all friction and made the conversion path unmissable on every screen size.",
    results: "A live professional web presence that converts emergency traffic into booked jobs, with SEO-ready structure and a design that projects credibility and speed from the first scroll.",
    client: "Apex Towing",
    services: ["Web Design", "React", "Lead Generation", "SEO"],
    liveUrl: "https://apex-towing-final.vercel.app/",
    mainImage: "/projects/apex-towing-hero.jpg",
    thumbImage: "/projects/apex-towing-thumb.jpg",
    galleryImages: [
      "/projects/apex-towing-detail.jpg",
      "/projects/apex-towing-hero.jpg"
    ]
  },
  {
    id: "03",
    slug: "bagel-bar",
    title: "Bagel Bar",
    year: "2026",
    category: "Web Design",
    description: "Warm, appetite-driven website for a local artisan bagel shop — designed to drive foot traffic and online orders.",
    overview: "Bagel Bar needed a digital presence that matched the warmth and quality of their product. We built a food-forward website with a custom menu display, online pre-ordering, and location-based SEO — translating the artisan experience into an inviting digital storefront.",
    challenges: "Translating the sensory experience of a physical food shop into a website that actually makes people hungry. The design needed to feel warm and local, not corporate — using type, layout, and imagery that invited rather than just informed.",
    results: "A live, beautifully branded website that brings Bagel Bar's personality online, driving both in-store foot traffic and pre-orders through a menu and ordering experience that's as fresh as the product itself.",
    client: "Bagel Bar",
    services: ["Web Design", "React", "Menu Integration", "Local SEO"],
    liveUrl: "https://bagel-bar-v2.vercel.app/",
    mainImage: "/projects/bagel-bar-hero.jpg",
    thumbImage: "/projects/bagel-bar-thumb.jpg",
    galleryImages: [
      "/projects/bagel-bar-detail.jpg",
      "/projects/bagel-bar-hero.jpg"
    ]
  }
];
