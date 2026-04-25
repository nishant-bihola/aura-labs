import { motion } from "motion/react";
import { Instagram, Twitter, ArrowUpRight } from "lucide-react";

export default function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  // Navigation Links removed from internal rendering. 

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-[100] px-12 py-8 flex justify-between items-center mix-blend-difference">
        <div className="flex gap-8 items-center cursor-pointer">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-[10px] uppercase kerning-wide font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-3 group"
          >
            <div className="flex flex-col gap-1 w-5">
               <motion.div animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 5 : 0 }} className="w-full h-[1px] bg-white transition-transform" />
               <motion.div animate={{ opacity: isOpen ? 0 : 1 }} className="w-full h-[1px] bg-white transition-opacity" />
               <motion.div animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -5 : 0 }} className="w-full h-[1px] bg-white transition-transform" />
            </div>
            {isOpen ? "Close" : "Menu"}
          </button>
          <a href="#work" className="text-[10px] uppercase kerning-wide font-medium opacity-60 hover:opacity-100 transition-opacity hidden lg:block">
            Projects
          </a>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold tracking-tighter absolute left-12"
        >
          <a href="/" className="no-underline text-white uppercase flex items-center gap-1">
            Aura Labs <span className="font-light text-sm">©</span>
          </a>
        </motion.div>

        <div className="flex gap-4 items-center absolute right-12">
          <a 
            href="https://cal.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white text-black px-6 py-2 rounded-full text-[11px] uppercase kerning-wide font-bold overflow-hidden h-9 flex items-center justify-center transition-all hover:scale-105"
          >
            <div className="relative h-4 overflow-hidden pointer-events-none">
              <div className="flex flex-col transition-transform duration-500 ease-[0.16, 1, 0.3, 1] group-hover:-translate-y-1/2">
                <span className="h-4 flex items-center">LET'S TALK</span>
                <span className="h-4 flex items-center">BOOK A CALL</span>
              </div>
            </div>
          </a>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-5 h-5 bg-white rounded-full hidden md:block hover:scale-110 transition-transform cursor-pointer"
          />
        </div>
      </header>
    </>
  );
}
