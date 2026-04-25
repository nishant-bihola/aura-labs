import { motion } from "motion/react";

export default function VideoShowreel() {
  return (
    <section className="relative h-[80vh] border-x border-border-soft mx-6 overflow-hidden group cursor-pointer">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
        poster="https://cdn.prod.website-files.com/697344b93b0e03014bb98903%2F6978bd9529fa960bd75eefa5_7534729-uhd_4096_2160_25fps_poster.0000000.jpg"
      >
        <source 
          src="https://cdn.prod.website-files.com/697344b93b0e03014bb98903%2F6978bd9529fa960bd75eefa5_7534729-uhd_4096_2160_25fps_mp4.mp4" 
          type="video/mp4" 
        />
      </video>

      <div className="absolute inset-0 flex flex-col justify-between p-12 z-10 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="text-[10px] uppercase kerning-wide font-medium opacity-60">Showreel</div>
          <div className="bg-brand-text text-brand-bg px-6 py-2 rounded-full text-[10px] uppercase kerning-wide font-bold">
            Play Video
          </div>
        </div>

        <div className="flex justify-between items-end">
          <h2 className="text-8xl md:text-[10vw] font-normal serif italic leading-none tracking-tighter">
            Cinema
          </h2>
          <div className="text-4xl serif italic opacity-40">©26</div>
        </div>
      </div>
    </section>
  );
}
