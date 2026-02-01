export type Category = 'All' | 'Favorites' | 'Hidden' | 'Sports' | 'News' | 'Movies' | 'Music' | 'Kids' | 'Documentary' | 'Lifestyle' | 'Other';

export interface ApiChannel {
  id: string;
  name: string;
  alt_names: string[];
  network: string | null;
  owners: string[];
  country: string;
  categories: string[];
  is_nsfw: boolean;
  website: string | null;
  logo?: string; 
}

export interface ApiStream {
  channel: string;
  url: string;
  quality: string; 
  userAgent?: string;
  referrer?: string;
}

export interface ApiLogo {
  channel: string;
  url: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: Category;
  url: string;
  inputType?: 'm3u8' | 'embed';
  sportType?: string; 
  description?: string;
  country?: string;      // ISO Code e.g., 'US'
  countryName?: string;  // Full Name e.g., 'United States'
  region?: string;       // Continent e.g., 'North America'
  isFavorite?: boolean;  // UI state
  isHidden?: boolean;    // UI state
}

export const FALLBACK_CHANNELS: Channel[] = [
  {
    id: 'nasa',
    name: 'NASA TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/200px-NASA_logo.svg.png',
    category: 'News',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    inputType: 'm3u8',
    description: 'Official stream of NASA.',
    country: 'US',
    countryName: 'United States',
    region: 'North America'
  }
];

export const SORT_OPTIONS = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Category', value: 'category' },
    { label: 'Country', value: 'country' },
];