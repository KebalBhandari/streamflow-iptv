import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Channel } from '../types';
import { 
  Maximize, Minimize, Volume2, VolumeX, Volume1, X, 
  ShieldAlert, ExternalLink, Settings, Play, Pause,
  Tv, Globe, Loader2, Expand, Shrink, RefreshCw
} from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
  theaterMode: boolean;
  toggleTheaterMode: () => void;
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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose, theaterMode, toggleTheaterMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);
  
  // HLS Levels
  const [levels, setLevels] = useState<{height: number, index: number}[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState(false);
  
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const isEmbed = channel.inputType === 'embed';

  // --- HLS & Source Logic ---
  useEffect(() => {
    // If it's an embed, we don't need HLS logic
    if (isEmbed) {
      setIsLoading(false);
      setError(null);
      return;
    }

    // Reset State immediately on channel change or retry
    setError(null);
    setIsLoading(true);
    setLevels([]);
    setShowSettings(false);

    const video = videoRef.current;
    
    // If video ref is missing (shouldn't happen with new render logic), we can't attach
    if (!video) return;

    const playStream = () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        
        const hls = new Hls({ 
          enableWorker: true, 
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsRef.current = hls;

        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsLoading(false);
          const availableLevels = data.levels.map((l, idx) => ({ height: l.height, index: idx }));
          setLevels(availableLevels.sort((a, b) => b.height - a.height));
          // Attempt playback
          const playPromise = video.play();
          if (playPromise !== undefined) {
             playPromise.then(() => {
                setIsPlaying(true);
             }).catch(() => {
                setIsPlaying(false);
             });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
           // Optional: Update UI
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
             switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                   setIsLoading(false);
                   setError(<div className="text-center"><ShieldAlert className="mx-auto mb-2 text-amber-500" />Stream Offline / Geo-Blocked</div>);
                   break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                   hls.recoverMediaError();
                   break;
                default:
                   setIsLoading(false);
                   setError('Fatal Stream Error');
                   hls.destroy();
                   break;
             }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
           setIsLoading(false);
           video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
        video.addEventListener('error', () => {
           setIsLoading(false);
           setError("Format not supported");
        });
      }
    };

    playStream();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [channel, isEmbed, retryTrigger]);

  // --- Interaction Logic ---
  
  const handleRetry = () => {
    setRetryTrigger(prev => prev + 1);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) videoRef.current.volume = volume; // Restore
      else setVolume(0); // Mute visual
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowSettings(false);
    }
  };

  // Hide controls on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      
      {/* 1. Video Container Area */}
      <div 
        ref={containerRef}
        className={`relative group bg-black flex items-center justify-center overflow-hidden ${isFullscreen ? 'h-screen w-screen' : 'w-full aspect-video bg-black/50'}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {isEmbed ? (
           <iframe 
              src={channel.url} 
              className="w-full h-full border-0" 
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
              allowFullScreen
           />
        ) : (
          <>
            {/* Loading State */}
            {isLoading && !error && (
               <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
               </div>
            )}
            
            {/* Error State Overlay */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] text-slate-400 text-xs p-4 text-center z-30">
                 {error}
                 <div className="flex gap-3 mt-4">
                    <button onClick={handleRetry} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded text-white flex items-center gap-2">
                        <RefreshCw size={14} /> Retry
                    </button>
                    <button onClick={() => onClose()} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white">Close</button>
                 </div>
              </div>
            )}

            {/* Video Element - Always rendered (but hidden if error) to preserve ref for HLS re-init on prop change */}
            <video 
              ref={videoRef} 
              className={`h-full w-full object-contain ${error ? 'invisible' : 'visible'}`} 
              playsInline 
              onClick={handlePlayPause}
            />

            {/* Custom Controls Overlay */}
            {!error && !isLoading && (
              <div 
                className={`
                  absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent 
                  flex flex-col justify-end p-4 transition-opacity duration-300 z-20
                  ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}
                `}
              >
                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-16 right-4 bg-black/90 border border-white/10 rounded-lg p-2 min-w-[150px] shadow-xl z-30 backdrop-blur-md">
                     <p className="text-xs font-bold text-slate-400 mb-2 px-2">Quality</p>
                     <button 
                       onClick={() => handleQualityChange(-1)}
                       className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/10 ${currentLevel === -1 ? 'text-violet-400 font-bold' : 'text-white'}`}
                     >
                       Auto
                     </button>
                     {levels.map((lvl) => (
                       <button 
                         key={lvl.index}
                         onClick={() => handleQualityChange(lvl.index)}
                         className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/10 ${currentLevel === lvl.index ? 'text-violet-400 font-bold' : 'text-white'}`}
                       >
                         {lvl.height}p
                       </button>
                     ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handlePlayPause} 
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>

                    <div className="flex items-center gap-2 group/vol">
                       <button onClick={toggleMute} className="text-white hover:text-violet-300">
                          {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                       </button>
                       <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.05" 
                         value={isMuted ? 0 : volume}
                         onChange={handleVolumeChange}
                         className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-violet-500"
                       />
                    </div>
                    
                    <div className="flex items-center gap-2 px-2 py-1 bg-red-600/90 rounded text-[10px] font-bold tracking-widest text-white shadow-lg">
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    {levels.length > 0 && (
                      <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'text-violet-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                        title="Quality Settings"
                      >
                        <Settings size={18} />
                      </button>
                    )}

                    <button 
                      onClick={toggleTheaterMode} 
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
                      title={theaterMode ? "Exit Theater Mode" : "Theater Mode"}
                    >
                      {theaterMode ? <Shrink size={18} /> : <Expand size={18} />}
                    </button>
                    
                    <button 
                      onClick={toggleFullscreen} 
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      title="Fullscreen"
                    >
                      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 2. Channel Details Section */}
      <div className="flex-1 overflow-y-auto p-6 border-t border-white/5 bg-[#080808]">
        <div className="flex items-start justify-between mb-4">
           <div>
              <h2 className="text-xl font-bold text-white mb-1 leading-tight">{channel.name}</h2>
              <div className="flex items-center flex-wrap gap-2 text-sm text-slate-400 mt-2">
                 <span className="px-2.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                    {channel.category}
                 </span>
                 {channel.country && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
                       <span>{getFlagEmoji(channel.country)}</span>
                       <span>{channel.countryName || channel.country}</span>
                    </span>
                 )}
              </div>
           </div>
           
           <div className="flex items-center gap-2">
               <button 
                 onClick={onClose} 
                 className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                 title="Close Player"
               >
                  <X size={20} />
               </button>
               <button 
                 onClick={handleRetry}
                 className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                 title="Retry Connection"
               >
                  <RefreshCw size={20} />
               </button>
           </div>
        </div>

        <div className="space-y-4">
           {channel.description ? (
             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tv size={14} className="text-violet-400"/> About
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                   {channel.description}
                </p>
             </div>
           ) : (
             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-sm text-slate-500 italic">No description available for this channel.</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                 <div className="text-xs text-slate-500 mb-1">Stream Type</div>
                 <div className="text-sm font-medium text-slate-300 uppercase">{channel.inputType || 'HLS'}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
                 <div className="text-xs text-slate-500 mb-1">Resolution</div>
                 <div className="text-sm font-medium text-slate-300">
                    {currentLevel !== -1 && levels[currentLevel] 
                      ? `${levels[currentLevel].height}p` 
                      : levels.length > 0 ? 'Auto' : 'Unknown'}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};