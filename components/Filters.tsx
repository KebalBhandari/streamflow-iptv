import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Search, Check, Globe, MapPin, ArrowUpDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  icon,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full bg-[#151515] border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500/50 hover:bg-white/5 transition-all min-w-[180px] justify-between group shadow-sm z-10 relative"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-500 group-hover:text-violet-400 transition-colors">{icon}</span>
          <span className={`truncate ${selectedOption ? 'text-slate-200' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden backdrop-blur-xl"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-white/5 bg-[#151515]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#0a0a0a] border border-white/10 text-slate-200 pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600 transition-all"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors group ${value === opt.value ? 'bg-violet-600/10 text-violet-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  <span className="truncate mr-2">{opt.label}</span>
                  {value === opt.value && <Check size={14} className="text-violet-400 flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-600">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FiltersProps {
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  availableRegions: string[];
  availableCountries: { code: string; name: string }[];
  sortOptions: { label: string; value: string }[];
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedCountry,
  onSelectCountry,
  sortBy,
  onSortChange,
  availableRegions,
  availableCountries,
  sortOptions,
  onReset
}) => {
  
  // Transform data for dropdowns
  const regionOptions = [
    { label: 'All Regions', value: 'All' },
    ...availableRegions.map(r => ({ label: r, value: r }))
  ];

  const countryOptions = [
    { label: 'All Countries', value: 'All' },
    ...availableCountries.map(c => ({ label: c.name, value: c.code }))
  ];

  const sortDropdownOptions = sortOptions.map(s => ({ label: s.label, value: s.value }));

  const hasActiveFilters = selectedRegion !== 'All' || selectedCountry !== 'All' || sortBy !== 'name_asc';

  return (
    <div className="bg-[#121212]/95 border-y border-white/5 p-4 mb-6 sticky top-0 z-40 backdrop-blur-md shadow-xl shadow-black/20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">
            <Filter size={14} /> Filters
          </div>
          
          <SearchableDropdown
            options={regionOptions}
            value={selectedRegion}
            onChange={onSelectRegion}
            placeholder="Select Region"
            icon={<Globe size={16} />}
            className="w-full sm:w-auto"
          />

          <SearchableDropdown
            options={countryOptions}
            value={selectedCountry}
            onChange={onSelectCountry}
            placeholder="Select Country"
            icon={<MapPin size={16} />}
            className="w-full sm:w-auto"
          />

           <SearchableDropdown
            options={sortDropdownOptions}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort By"
            icon={<ArrowUpDown size={16} />}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Active Filters / Reset */}
        {hasActiveFilters && (
          <button 
            onClick={onReset}
            className="w-full md:w-auto text-xs font-medium text-red-400 hover:text-red-300 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/10 hover:border-red-500/30"
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};