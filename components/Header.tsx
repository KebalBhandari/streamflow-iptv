import React from 'react';
import { Search, Menu, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  searchQuery, 
  setSearchQuery,
}) => {
  return (
    <header className="h-20 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 gap-6">
      
      {/* Left: Menu & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search Input */}
        <div className="relative w-full group">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 pointer-events-none">
             <Search className="text-slate-500 group-focus-within:text-violet-400 transition-colors w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels, sports..."
            className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-violet-500/30 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 cursor-pointer group">
           <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border-2 border-[#050505] ring-2 ring-transparent group-hover:ring-white/10 transition-all overflow-hidden">
             <img 
               src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" 
               alt="User"
               className="w-full h-full object-cover"
             />
           </div>
           <div className="hidden sm:block">
             <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">Guest User</div>
             <div className="text-[10px] text-slate-500">Free Plan</div>
           </div>
        </div>
      </div>
    </header>
  );
};