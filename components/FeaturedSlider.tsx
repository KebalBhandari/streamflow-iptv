import React, { useState, useEffect } from 'react';
import { Channel } from '../types';
import { PlayCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface FeaturedSliderProps {
  channels: Channel[];
  onPlay: (channel: Channel) => void;
}

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop', // Soccer
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop', // Stadium
  'https://images.unsplash.com/photo-1517604931442-71053e6e2619?q=80&w=2000&auto=format&fit=crop', // Cinema/Dark
  'https://images.unsplash.com/photo-1593341646226-7206b2554125?q=80&w=2000&auto=format&fit=crop', // Gaming/Action
  'https://images.unsplash.com/photo-1495563923587-bd742863486d?q=80&w=2000&auto=format&fit=crop', // News/Lifestyle
];

export const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ channels, onPlay }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % channels.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [channels.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % channels.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + channels.length) % channels.length);

  if (!channels || channels.length === 0) return null;

  return (
    <div className="relative w-full h-[55vh] min-h-[450px] overflow-hidden group bg-[#050505]">
      
      {/* Background Slides */}
      <div className="absolute inset-0">
         {channels.map((ch, idx) => (
            <div 
                key={`${ch.id}-${idx}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Image */}
                <div className="absolute inset-0">
                    <img 
                        src={WALLPAPERS[idx % WALLPAPERS.length]} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60 transition-transform duration-[20000ms] ease-linear transform scale-100 group-hover:scale-110"
                    />
                </div>

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/50 to-transparent" />
            </div>
         ))}
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-end">
         <div className="w-full max-w-7xl mx-auto px-6 md:px-8 pb-12 md:pb-16 relative z-20">
             
             {/* Text Content */}
             {channels.map((ch, idx) => (
                 <div 
                    key={ch.id}
                    className={`transition-all duration-700 absolute bottom-16 md:bottom-20 left-6 md:left-8 right-8 max-w-3xl
                        ${idx === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                 >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                            Featured {ch.category}
                        </span>
                        {ch.country && (
                            <span className="px-2 py-1 rounded bg-white/10 text-slate-300 text-xs font-medium backdrop-blur-md">
                                {ch.country}
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-2xl">
                        {ch.name}
                    </h1>
                    
                    <p className="text-base md:text-lg text-slate-200 mb-8 max-w-xl line-clamp-2 drop-shadow-lg leading-relaxed">
                        {ch.description || `Watch ${ch.name} live stream. The best place for ${ch.category.toLowerCase()} content and live broadcasts.`}
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => onPlay(ch)}
                            className="group/btn relative overflow-hidden bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 text-sm md:text-base shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105"
                        >
                            <PlayCircle size={22} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" /> 
                            <span>Watch Live</span>
                        </button>
                        
                        <div className="hidden md:flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-slate-300">
                             <Info size={16} className="text-violet-400" />
                             <span>Live Broadcast</span>
                        </div>
                    </div>
                 </div>
             ))}

             {/* Slider Controls */}
             <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
                 {/* Indicators */}
                 <div className="flex gap-3">
                    {channels.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-12 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                 </div>

                 {/* Arrows */}
                 <div className="flex gap-3">
                     <button 
                        onClick={prevSlide}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/20 border border-white/5 text-slate-300 hover:text-white transition-all backdrop-blur-md group/nav"
                     >
                        <ChevronLeft size={20} className="group-hover/nav:-translate-x-0.5 transition-transform" />
                     </button>
                     <button 
                        onClick={nextSlide}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/20 border border-white/5 text-slate-300 hover:text-white transition-all backdrop-blur-md group/nav"
                     >
                        <ChevronRight size={20} className="group-hover/nav:translate-x-0.5 transition-transform" />
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
