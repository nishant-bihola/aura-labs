import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
  {
    id: "01",
    title: "Forma Digital",
    year: "2026",
    category: "Branding",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98908/6973b5a92c0b641bd8958bd5_work01-p-1600.webp",
  },
  {
    id: "02",
    title: "Nero Vision",
    year: "2025",
    category: "Web Design",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98908/6973da2b758fc62605475c44_work02-p-1600.webp",
  },
  {
    id: "03",
    title: "One Step",
    year: "2024",
    category: "Development",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98908/6973d8bbb3640c94c81b692d_work03-p-1600.webp",
  },
  {
    id: "04",
    title: "Bold Moves",
    year: "2025",
    category: "Social Media",
    image: "https://cdn.prod.website-files.com/697344b93b0e03014bb98908/6973dc39ae46293cfc21b377_Focused-Woman-in-Motion-p-1600.webp",
  },
];

export default function WorkSection() {
  return (
    <section id="work" className="py-20 md:py-32 px-4 md:px-6 border-x border-border-soft mx-4 md:mx-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] md:text-[40vw] font-black opacity-[0.02] select-none pointer-events-none serif italic leading-none">
        Works
      </div>
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12 md:mb-24 border-b border-border-soft pb-8">
          <h2 className="text-[9px] md:text-[10px] uppercase kerning-wide font-medium opacity-60">
            Selected Projects <span className="opacity-40 ml-2">/2026</span>
          </h2>
          <div className="text-right hidden lg:block">
            <p className="text-[10px] uppercase kerning-wide font-medium opacity-40">Berlin • Tokyo • New York</p>
          </div>
        </div>

        <div className="flex flex-col">
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-cursor="view-more"
              className="group relative border-b border-border-soft py-12 md:py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 cursor-none"
            >
              <div className="absolute left-1/2 top-0 w-64 h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden lg:block overflow-hidden rounded-sm z-10 -translate-x-1/2 -translate-y-1/2 mt-10">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                />
              </div>

              <div className="flex items-center gap-8 md:gap-16">
                <span className="text-xs md:text-sm font-medium opacity-20 serif italic">{project.id}</span>
                <h3 className="text-4xl md:text-7xl lg:text-8xl font-normal serif italic tracking-tighter group-hover:pl-4 transition-all duration-500">
                  {project.title}
                </h3>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1">
                <p className="text-[10px] md:text-xs uppercase kerning-wide font-bold opacity-80 flex items-center gap-2">
                  {project.category}
                  <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
                </p>
                <p className="text-[9px] md:text-[10px] uppercase kerning-wide font-medium opacity-40">Est. {project.year}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
