import React from 'react';
import { 
  Home, Trophy, Film, Newspaper, Music, Baby, 
  Clapperboard, Tv, Heart, EyeOff, X, Globe, Zap
} from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  isOpen: boolean;
  onClose: () => void;
}

type Section = {
  title: string;
  items: { id: Category; icon: React.ReactNode; label: string }[];
};

const SECTIONS: Section[] = [
  {
    title: 'Discover',
    items: [
      { id: 'All', icon: <Home size={18} />, label: 'Home' },
      { id: 'Sports', icon: <Trophy size={18} />, label: 'Sports' },
      { id: 'News', icon: <Newspaper size={18} />, label: 'News' },
    ]
  },
  {
    title: 'Entertainment',
    items: [
      { id: 'Movies', icon: <Film size={18} />, label: 'Cinema' },
      { id: 'Music', icon: <Music size={18} />, label: 'Music' },
      { id: 'Lifestyle', icon: <Tv size={18} />, label: 'Lifestyle' },
      { id: 'Kids', icon: <Baby size={18} />, label: 'Kids' },
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { id: 'Documentary', icon: <Clapperboard size={18} />, label: 'Documentary' },
    ]
  },
  {
    title: 'Personal',
    items: [
      { id: 'Favorites', icon: <Heart size={18} />, label: 'Favorites' },
      { id: 'Hidden', icon: <EyeOff size={18} />, label: 'Hidden' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onSelectCategory,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative z-50 h-full w-72 bg-[#080808] border-r border-white/5 flex flex-col transition-transform duration-300 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
                <Zap size={20} className="text-white fill-white" />
             </div>
             <div>
               <h1 className="text-lg font-bold text-white tracking-wide leading-none">Stream<span className="text-violet-400">Flow</span></h1>
               <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Premium TV</span>
             </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-8">
          {SECTIONS.map((section, idx) => (
            <div key={idx}>
              <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{section.title}</div>
              <div className="space-y-1">
                {section.items.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                          onSelectCategory(cat.id);
                          onClose();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive
                          ? 'bg-violet-500/10 text-violet-300' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                      )}
                      
                      <span className={`relative z-10 transition-colors ${isActive ? 'text-violet-400' : 'group-hover:text-white'}`}>
                        {cat.icon}
                      </span>
                      <span className="font-medium text-sm relative z-10">{cat.label}</span>
                      
                      {cat.id === 'Favorites' && (
                         <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pro / Footer Area */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-white/5 rounded-xl p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe size={48} />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">Global Access</h4>
            <p className="text-xs text-slate-400 mb-3">Watch streams from 100+ countries.</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-violet-500 rounded-full" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};