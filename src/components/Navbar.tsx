import { motion } from "motion/react";
import { Instagram, Twitter, ArrowUpRight } from "lucide-react";

export default function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  // Navigation Links removed from internal rendering. 

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-[100] px-12 py-8 flex items-center mix-blend-difference">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold tracking-tighter absolute left-12 md:left-12"
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
