import { Channel, Category, ApiChannel, ApiStream, ApiLogo } from './types';

const API_BASE = 'https://iptv-org.github.io/api';

// Simple mapping for common countries to regions
const REGION_MAP: Record<string, string> = {
    // North America
    US: 'North America', CA: 'North America', MX: 'North America', CR: 'North America', PA: 'North America',
    DO: 'North America', GT: 'North America', HN: 'North America', JM: 'North America', PR: 'North America',
    
    // South America
    AR: 'South America', BO: 'South America', BR: 'South America', CL: 'South America', CO: 'South America',
    EC: 'South America', PE: 'South America', PY: 'South America', UY: 'South America', VE: 'South America',

    // Europe
    GB: 'Europe', UK: 'Europe', DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe', PT: 'Europe',
    NL: 'Europe', BE: 'Europe', SE: 'Europe', NO: 'Europe', DK: 'Europe', FI: 'Europe', RU: 'Europe',
    UA: 'Europe', PL: 'Europe', CH: 'Europe', AT: 'Europe', CZ: 'Europe', GR: 'Europe', TR: 'Europe',
    IE: 'Europe', RO: 'Europe', HU: 'Europe', HR: 'Europe', RS: 'Europe', BG: 'Europe', SK: 'Europe',
    SI: 'Europe', EE: 'Europe', LV: 'Europe', LT: 'Europe', BY: 'Europe', MD: 'Europe', AL: 'Europe',
    MK: 'Europe', BA: 'Europe', ME: 'Europe',

    // Asia
    CN: 'Asia', JP: 'Asia', KR: 'Asia', IN: 'Asia', ID: 'Asia', TH: 'Asia', VN: 'Asia', MY: 'Asia',
    PH: 'Asia', SG: 'Asia', PK: 'Asia', BD: 'Asia', HK: 'Asia', TW: 'Asia', SA: 'Asia', AE: 'Asia',
    IL: 'Asia', IR: 'Asia', IQ: 'Asia', QA: 'Asia', KW: 'Asia', LB: 'Asia', JO: 'Asia',

    // Oceania
    AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania',

    // Africa
    ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa', GH: 'Africa', MA: 'Africa', DZ: 'Africa',
    SN: 'Africa', TZ: 'Africa', UG: 'Africa', CM: 'Africa', CI: 'Africa'
};

// Map API category strings to our App's Category type
const mapApiCategory = (apiCats: string[]): Category => {
  if (!apiCats || apiCats.length === 0) return 'Other';

  // Priority check
  if (apiCats.includes('sports')) return 'Sports';
  if (apiCats.includes('news') || apiCats.includes('weather') || apiCats.includes('business')) return 'News';
  if (apiCats.includes('movies') || apiCats.includes('entertainment') || apiCats.includes('comedy') || apiCats.includes('classic')) return 'Movies';
  if (apiCats.includes('music')) return 'Music';
  if (apiCats.includes('kids') || apiCats.includes('animation') || apiCats.includes('family')) return 'Kids';
  if (apiCats.includes('documentary') || apiCats.includes('science') || apiCats.includes('education')) return 'Documentary';
  if (apiCats.includes('lifestyle') || apiCats.includes('cooking') || apiCats.includes('travel') || apiCats.includes('auto')) return 'Lifestyle';

  return 'Other';
};

// Heuristic to detect sport type from name since API categories are generic "sports"
const detectSportType = (name: string, categories: string[]): string | undefined => {
  const n = name.toLowerCase();
  
  if (n.includes('soccer') || n.includes('football') || n.includes('league') || n.includes('bundesliga') || n.includes('liga')) return 'Football';
  if (n.includes('basket') || n.includes('nba')) return 'Basketball';
  if (n.includes('racing') || n.includes('motor') || n.includes('f1') || n.includes('speed') || n.includes('auto')) return 'Racing';
  if (n.includes('fight') || n.includes('mma') || n.includes('box') || n.includes('wwe') || n.includes('wrestling')) return 'Combat';
  if (n.includes('tennis') || n.includes('wta') || n.includes('atp')) return 'Tennis';
  if (n.includes('golf') || n.includes('pga')) return 'Golf';
  if (n.includes('cricket')) return 'Cricket';
  if (n.includes('sport')) return 'General';
  
  return 'Other Sports';
};

export const generateDeviceId = async (): Promise<string> => {
  // Collect browser-specific details
  const data = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    // @ts-ignore
    navigator.deviceMemory || 'unknown',
    navigator.hardwareConcurrency || 'unknown',
  ].join('|');

  // Generate SHA-256 hash
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return a truncated version (first 16 chars)
  return hashHex.substring(0, 16);
};

export const fetchChannelsFromApi = async (): Promise<Channel[]> => {
  try {
    // Parallel fetch for speed
    const [streamsRes, channelsRes, logosRes] = await Promise.all([
      fetch(`${API_BASE}/streams.json`),
      fetch(`${API_BASE}/channels.json`),
      fetch(`${API_BASE}/logos.json`)
    ]);

    if (!streamsRes.ok || !channelsRes.ok) {
      throw new Error('Failed to fetch API data');
    }

    const streams: ApiStream[] = await streamsRes.json();
    const channelsData: ApiChannel[] = await channelsRes.json();
    const logosData: ApiLogo[] = await logosRes.json();

    // Index Channels by ID for O(1) lookup
    const channelMap = new Map<string, ApiChannel>();
    channelsData.forEach(c => channelMap.set(c.id, c));

    // Index Logos by ID
    const logoMap = new Map<string, string>();
    logosData.forEach(l => logoMap.set(l.channel, l.url));

    // Prepare helpers
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    // Build the final channel list
    const processedChannels: Channel[] = [];
    
    // Deduplication Set: "Name|Country"
    // Prevents "Channel 5 (HD)" and "Channel 5 (SD)" showing as duplicates if we normalize name,
    // or simply prevents the exact same channel showing up twice from different stream sources.
    const seenChannels = new Set<string>(); 

    // We iterate through STREAMS because those are what we can actually play.
    for (const stream of streams) {
      // 1. Validation: Must have a URL
      if (!stream.url) continue;
      
      // 2. Lookup Metadata
      const channelInfo = channelMap.get(stream.channel);
      
      // If we don't have channel info, skip it
      if (!channelInfo) continue; 
      
      // 3. Deduplication Check
      // We use a composite key of Name + Country. 
      // This ensures we only show one "BBC One" for "UK", even if the API has 3 streams for it.
      const uniqueKey = `${channelInfo.name.toLowerCase()}|${channelInfo.country}`;
      if (seenChannels.has(uniqueKey)) continue;
      
      // 3. Map Category
      const appCategory = mapApiCategory(channelInfo.categories);
      
      // 4. Determine Sport Type if needed
      let sportType = undefined;
      if (appCategory === 'Sports') {
        sportType = detectSportType(channelInfo.name, channelInfo.categories);
      }

      // 5. Lookup Logo
      const logoUrl = logoMap.get(stream.channel) || 'https://via.placeholder.com/150?text=' + channelInfo.name.charAt(0);

      // 6. Resolve Country Name and Region
      let fullCountryName = channelInfo.country;
      try {
        if (channelInfo.country) {
            fullCountryName = regionNames.of(channelInfo.country) || channelInfo.country;
        }
      } catch (e) {
          // Fallback if code is invalid
      }

      // Use uppercase for map lookup to be safe
      const upperCountry = channelInfo.country ? channelInfo.country.toUpperCase() : '';
      const region = REGION_MAP[upperCountry] || 'Other Regions';

      // Mark as seen
      seenChannels.add(uniqueKey);

      processedChannels.push({
        id: stream.channel, 
        name: channelInfo.name,
        logo: logoUrl,
        category: appCategory,
        url: stream.url,
        country: channelInfo.country,
        countryName: fullCountryName,
        region: region,
        sportType: sportType,
        description: channelInfo.network ? `Network: ${channelInfo.network}` : undefined,
      });
    }

    // Sort: Sports first, then by name
    return processedChannels.sort((a, b) => {
      if (a.category === 'Sports' && b.category !== 'Sports') return -1;
      if (a.category !== 'Sports' && b.category === 'Sports') return 1;
      return a.name.localeCompare(b.name);
    });

  } catch (error) {
    console.error("Error fetching from IPTV-ORG API:", error);
    return [];
  }
};