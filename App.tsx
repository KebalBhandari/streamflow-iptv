import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChannelGrid } from './components/ChannelGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { Header } from './components/Header';
import { Pagination } from './components/Pagination';
import { Filters } from './components/Filters';
import { FeaturedSlider } from './components/FeaturedSlider';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Channel, Category, FALLBACK_CHANNELS, SORT_OPTIONS } from './types';
import { fetchChannelsFromApi } from './utils';
import { Loader2, RefreshCw, GripVertical } from 'lucide-react';

const ITEMS_PER_PAGE = 40;

const App: React.FC = () => {
  // App State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Persistence State
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);

  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
  // Filter State
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Featured Channels
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; channelId: string | null; channelName: string }>({
    isOpen: false,
    channelId: null,
    channelName: ''
  });

  // Load Saved Data
  useEffect(() => {
    try {
      // Load Favorites
      const savedFavs = localStorage.getItem('streamflow_favorites');
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }

      // Load Hidden
      const savedHidden = localStorage.getItem('streamflow_hidden');
      if (savedHidden) {
        setHiddenChannels(new Set(JSON.parse(savedHidden)));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  // --- Resizing Logic ---
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseEvent.clientX;
        // Constraints: Min 300px, Max 70% of screen width
        if (newWidth > 300 && newWidth < window.innerWidth * 0.7) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none"; // Prevent text selection
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);


  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    
    setFavorites(newFavs);
    localStorage.setItem('streamflow_favorites', JSON.stringify(Array.from(newFavs)));
  };

  // Logic to open modal or unhide immediately
  const requestToggleHidden = (channel: Channel) => {
    if (hiddenChannels.has(channel.id)) {
      // If already hidden (we are likely in Hidden view), just unhide without confirmation
      performToggleHidden(channel.id);
    } else {
      // If visible, ask for confirmation
      setConfirmModal({
        isOpen: true,
        channelId: channel.id,
        channelName: channel.name
      });
    }
  };

  // Actual State update for Hidden
  const performToggleHidden = (id: string) => {
    const newHidden = new Set(hiddenChannels);
    if (newHidden.has(id)) newHidden.delete(id);
    else newHidden.add(id);

    setHiddenChannels(newHidden);
    localStorage.setItem('streamflow_hidden', JSON.stringify(Array.from(newHidden)));
  };

  // Initial Data Fetch
  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChannelsFromApi();
        if (data.length === 0) {
          setChannels(FALLBACK_CHANNELS);
          setFeaturedChannels(FALLBACK_CHANNELS);
          setError("Using offline backup.");
        } else {
          setChannels(data);
          
          // Select 5 featured channels: Prioritize Sports, but ensure variety
          const sports = data.filter(c => c.category === 'Sports');
          const others = data.filter(c => c.category !== 'Sports');
          
          let featured: Channel[] = [];
          if (sports.length >= 5) {
            // Pick 5 random sports channels
            featured = sports.sort(() => 0.5 - Math.random()).slice(0, 5);
          } else {
             // Mix
             featured = [...sports, ...others].sort(() => 0.5 - Math.random()).slice(0, 5);
          }
          setFeaturedChannels(featured);
        }
      } catch (err) {
        console.error(err);
        setChannels(FALLBACK_CHANNELS);
        setError("Network error.");
      } finally {
        setIsLoading(false);
      }
    };
    loadChannels();
  }, []);

  // Compute Locations for Dropdowns
  const availableData = useMemo(() => {
    const regions = new Set<string>();
    const countryMap = new Map<string, string>(); 

    channels.forEach(c => {
      // Don't include meta data of hidden channels unless we are in hidden view
      if (activeCategory !== 'Hidden' && hiddenChannels.has(c.id)) return;

      if (c.region) regions.add(c.region);

      // Filter countries based on selected Region if a region is selected
      if (selectedRegion === 'All' || c.region === selectedRegion) {
        if (c.country && c.countryName) countryMap.set(c.country, c.countryName);
      }
    });

    return {
      regions: Array.from(regions).sort(),
      countries: Array.from(countryMap.entries())
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [channels, selectedRegion, hiddenChannels, activeCategory]); 

  // Reset Country when Region changes
  useEffect(() => {
    setSelectedCountry('All');
  }, [selectedRegion]);

  // Main Filter Logic
  const processedChannels = useMemo(() => {
    let result = channels;

    // 1. Hidden & Category Logic
    if (activeCategory === 'Hidden') {
        // Only show hidden channels
        result = result.filter(ch => hiddenChannels.has(ch.id));
    } else {
        // Filter out hidden channels for all other views
        result = result.filter(ch => !hiddenChannels.has(ch.id));
        
        if (activeCategory === 'Favorites') {
            result = result.filter(ch => favorites.has(ch.id));
        } else if (activeCategory !== 'All') {
            // Standard Category Filter
            result = result.filter(ch => {
                if (activeCategory === 'Sports') return ch.category === 'Sports';
                return ch.category === activeCategory;
            });
        }
    }

    // 2. Region Filter
    if (selectedRegion !== 'All') {
       result = result.filter(ch => ch.region === selectedRegion);
    }

    // 3. Country Filter
    if (selectedCountry !== 'All') {
       result = result.filter(ch => ch.country === selectedCountry);
    }

    // 4. Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(ch => 
        ch.name.toLowerCase().includes(lower) || 
        (ch.sportType && ch.sportType.toLowerCase().includes(lower))
      );
    }

    // 5. Sorting
    result = [...result].sort((a, b) => {
        switch (sortBy) {
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'category': return a.category.localeCompare(b.category);
            case 'country': return (a.countryName || '').localeCompare(b.countryName || '');
            case 'name_asc': 
            default: return a.name.localeCompare(b.name);
        }
    });

    return result;
  }, [channels, activeCategory, searchQuery, selectedRegion, selectedCountry, sortBy, favorites, hiddenChannels]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, selectedRegion, selectedCountry, sortBy]);

  // Pagination Slice
  const currentChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedChannels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedChannels, currentPage]);

  const totalPages = Math.ceil(processedChannels.length / ITEMS_PER_PAGE);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-violet-500/30">
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={(cat) => {
           setActiveCategory(cat);
           setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Main Content Area - Split View */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Side: Grid */}
          <main className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${selectedChannel && !theaterMode ? 'md:mr-0' : ''}`}>
            
            {/* Featured Slider (Hero) */}
            {activeCategory === 'All' && !searchQuery && !selectedChannel && featuredChannels.length > 0 && (
               <FeaturedSlider 
                 channels={featuredChannels} 
                 onPlay={setSelectedChannel} 
               />
            )}

            {/* Filters */}
            <div className={`${activeCategory === 'All' && !searchQuery && !selectedChannel && featuredChannels.length > 0 ? '' : 'pt-6'}`}>
               <Filters 
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
                sortBy={sortBy}
                onSortChange={setSortBy}
                availableRegions={availableData.regions}
                availableCountries={availableData.countries}
                sortOptions={SORT_OPTIONS}
                onReset={() => {
                  setSelectedRegion('All');
                  setSelectedCountry('All');
                  setSortBy('name_asc');
                  setSearchQuery('');
                }}
              />
            </div>

            <div className="px-6 md:px-8 pb-32">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                {activeCategory === 'All' ? 'Trending Channels' : activeCategory}
                <span className="text-sm font-normal text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                  {processedChannels.length} results
                </span>
              </h2>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-violet-500 w-10 h-10" />
                </div>
              ) : currentChannels.length > 0 ? (
                <>
                    {/* Responsive Grid */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${selectedChannel && !theaterMode ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}>
                      {currentChannels.map(ch => (
                         <ChannelGrid 
                            key={ch.id}
                            channels={[ch]} 
                            onSelectChannel={setSelectedChannel}
                            currentChannelId={selectedChannel?.id}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            hiddenChannels={hiddenChannels}
                            onRequestToggleHidden={requestToggleHidden}
                         />
                      ))}
                    </div>
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                    <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
                    <p>No channels found. Try adjusting your filters or checking the Hidden section.</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Side: Persistent Player Panel */}
          {selectedChannel && (
            <>
              {/* Drag Handle (Only visible on Desktop & when not in Theater Mode) */}
              {!theaterMode && (
                <div
                  onMouseDown={startResizing}
                  className={`
                    hidden md:flex w-3 hover:w-3 cursor-col-resize z-[45] items-center justify-center
                    transition-colors duration-200 select-none
                    ${isResizing ? 'bg-violet-600' : 'bg-[#050505] hover:bg-violet-500/30'}
                    border-l border-white/5
                  `}
                >
                  <div className={`h-8 w-1 rounded-full ${isResizing ? 'bg-white' : 'bg-white/20'}`}></div>
                </div>
              )}

              <aside 
                className={`
                  fixed inset-0 z-50 md:static bg-[#080808] border-l border-white/5 flex flex-col transition-all duration-75 shadow-2xl
                  ${theaterMode ? 'md:absolute md:inset-0 md:z-40 w-full' : 'shrink-0'}
                `}
                style={!theaterMode && window.innerWidth >= 768 ? { width: sidebarWidth } : {}}
              >
                <VideoPlayer 
                  key={selectedChannel.id} 
                  channel={selectedChannel} 
                  onClose={() => {
                    setSelectedChannel(null);
                    setTheaterMode(false);
                  }} 
                  theaterMode={theaterMode}
                  toggleTheaterMode={() => setTheaterMode(!theaterMode)}
                />
              </aside>
            </>
          )}

        </div>
      </div>
      
      {/* Modals */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title="Hide Channel?"
        message={`Are you sure you want to hide "${confirmModal.channelName}"? It will be moved to the Hidden category and won't appear in standard lists.`}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmModal.channelId) {
            performToggleHidden(confirmModal.channelId);
          }
        }}
      />
    </div>
  );
};

export default App;