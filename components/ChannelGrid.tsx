import React from 'react';
import { Channel } from '../types';
import { Play, Heart, EyeOff, Eye } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  currentChannelId?: string;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
  onRequestToggleHidden: (channel: Channel) => void;
  hiddenChannels: Set<string>;
}

const getFlagEmoji = (countryCode?: string) => {
  if (!countryCode) return null;
  try {
    const codePoints = countryCode.toUpperCase().split('').map(char =>  127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return null;
  }
};

export const ChannelGrid: React.FC<ChannelGridProps> = ({ 
  channels, 
  onSelectChannel,
  currentChannelId,
  onToggleFavorite,
  favorites,
  onRequestToggleHidden,
  hiddenChannels
}) => {
  return (
    <>
      {channels.map((channel) => {
        const isFav = favorites.has(channel.id);
        const isHidden = hiddenChannels.has(channel.id);
        
        return (
          <div 
            key={channel.id}
            className={`
              group relative bg-[#121212] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10 hover:-translate-y-1 flex flex-col
              ${currentChannelId === channel.id ? 'border-violet-500/50 ring-1 ring-violet-500/20' : 'border-white/5 hover:border-white/10'}
            `}
          >
            {/* Image Section */}
            <div 
              onClick={() => onSelectChannel(channel)}
              className="aspect-video bg-[#0a0a0a] relative flex items-center justify-center p-6 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-transparent to-transparent"></div>
              
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-20 h-20 object-contain relative z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/150?text=${channel.name.charAt(0)}`;
                }}
              />

              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                 <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-white/20">
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                 </div>
              </div>

              <div className="absolute top-2 left-2 z-20">
                 <span className="px-1.5 py-0.5 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1 shadow-sm backdrop-blur-md">
                   Live
                 </span>
              </div>
            </div>

            {/* Content Section - Flex grow to push content properly */}
            <div className="p-4 relative flex-1 flex flex-col">
               
               {/* Actions: Favorite & Hide */}
               <div className="absolute top-3 right-3 flex items-center gap-1 z-30">
                 {/* Hide Button */}
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestToggleHidden(channel);
                    }}
                    className="text-slate-600 hover:text-slate-300 transition-colors p-1.5 hover:bg-white/5 rounded-full"
                    title={isHidden ? "Unhide" : "Hide Channel"}
                 >
                    {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>

                 {/* Favorite Button */}
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    className="text-slate-600 hover:text-pink-500 transition-colors p-1.5 hover:bg-white/5 rounded-full"
                    title="Toggle Favorite"
                 >
                    <Heart size={16} fill={isFav ? "#ec4899" : "none"} className={isFav ? "text-pink-500" : ""} />
                 </button>
               </div>

               <div onClick={() => onSelectChannel(channel)} className="cursor-pointer pr-16 flex-1">
                  {/* Changed truncate to line-clamp-2 for better visibility */}
                  <h3 className="font-bold text-slate-100 text-sm mb-2 leading-snug line-clamp-2" title={channel.name}>
                    {channel.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-auto">
                     <span className="text-violet-400 font-medium whitespace-nowrap">{channel.category}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1 opacity-80 whitespace-nowrap">
                        {getFlagEmoji(channel.country)} 
                        {channel.country || 'INT'}
                     </span>
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </>
  );
};