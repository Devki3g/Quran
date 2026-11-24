import { Reciter } from '../types/quran';
import { POPULAR_RECITERS } from '../constants/popularReciters';
import { sanitizeReciterList } from '../utils/securityUtils';

const MP3QURAN_BASE = 'https://www.mp3quran.net/api/v3';
const RECITERS_CACHE_KEY = 'mp3quran_reciters_cache_v2';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedReciters {
  timestamp: number;
  data: Reciter[];
}

export function sanitizeReciters(reciters: Reciter[]): Reciter[] {
  return sanitizeReciterList(reciters);
}

export async function fetchReciters(language = 'ar'): Promise<Reciter[]> {
  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(RECITERS_CACHE_KEY);
    if (cached) {
      const parsed: CachedReciters = JSON.parse(cached);
      if (
        parsed &&
        typeof parsed.timestamp === 'number' &&
        Date.now() - parsed.timestamp < CACHE_EXPIRY_MS &&
        Array.isArray(parsed.data)
      ) {
        const cleanCached = sanitizeReciters(parsed.data);
        if (cleanCached.length > 0) {
          return cleanCached;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read cached reciters', e);
  }

  // Fetch from official MP3Quran API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const safeLang = encodeURIComponent(language.replace(/[^a-zA-Z-]/g, '') || 'ar');

    const res = await fetch(`${MP3QURAN_BASE}/reciters?language=${safeLang}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`MP3Quran API error: ${res.status}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.reciters) && data.reciters.length > 0) {
      const reciters = sanitizeReciters(data.reciters);
      if (reciters.length > 0) {
        try {
          localStorage.setItem(
            RECITERS_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: reciters })
          );
        } catch (e) {
          // quota might be exceeded, ignore
        }
        return reciters;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from MP3Quran API, using fallback popular reciters', err);
  }

  // Fallback to verified curated list
  return sanitizeReciters(POPULAR_RECITERS);
}

export function filterReciters(
  reciters: Reciter[],
  searchQuery: string,
  selectedRiwayah?: string,
  selectedLetter?: string
): Reciter[] {
  let list = reciters;

  if (selectedLetter && selectedLetter !== 'الكل') {
    list = list.filter((r) => r.letter === selectedLetter);
  }

  if (selectedRiwayah && selectedRiwayah !== 'الكل') {
    list = list.filter((r) =>
      r.moshaf.some((m) => m.name.toLowerCase().includes(selectedRiwayah.toLowerCase()))
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.moshaf.some((m) => m.name.toLowerCase().includes(q))
    );
  }

  return list;
}
