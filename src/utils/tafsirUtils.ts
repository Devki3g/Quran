import { SurahTafsirMap } from '../types/quran';

/**
 * Safely strips HTML tags and decodes basic HTML entities from Tafsir strings
 * without using DOM injection or innerHTML.
 */
export function sanitizeTafsirText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parses `https://api.alquran.cloud/v1/surah/{n}/ar.muyassar` responses
 * into a 1-indexed `numberInSurah -> tafsirText` map.
 */
export function parseAlQuranCloudTafsir(payload: unknown): SurahTafsirMap | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as {
    code?: number;
    data?: {
      ayahs?: Array<{
        numberInSurah?: number;
        text?: string;
      }>;
    };
  };

  if (root.code !== 200 || !root.data || !Array.isArray(root.data.ayahs)) {
    return null;
  }

  const map: SurahTafsirMap = {};
  root.data.ayahs.forEach((ayah, index) => {
    const ayahNum =
      typeof ayah.numberInSurah === 'number' && ayah.numberInSurah > 0
        ? ayah.numberInSurah
        : index + 1;
    const cleaned = sanitizeTafsirText(ayah.text || '');
    if (cleaned) {
      map[ayahNum] = cleaned;
    }
  });

  return Object.keys(map).length > 0 ? map : null;
}

/**
 * Parses `https://quranenc.com/api/v1/translation/sura/arabic_moyassar/{n}` responses
 * into a 1-indexed `numberInSurah -> tafsirText` map.
 */
export function parseQuranEncTafsir(payload: unknown): SurahTafsirMap | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as {
    result?: Array<{
      aya?: string | number;
      translation?: string;
    }>;
  };

  if (!Array.isArray(root.result)) {
    return null;
  }

  const map: SurahTafsirMap = {};
  root.result.forEach((item, index) => {
    const parsedNum = Number(item.aya);
    const ayahNum = Number.isFinite(parsedNum) && parsedNum > 0 ? parsedNum : index + 1;
    const cleaned = sanitizeTafsirText(item.translation || '');
    if (cleaned) {
      map[ayahNum] = cleaned;
    }
  });

  return Object.keys(map).length > 0 ? map : null;
}

/**
 * Parses `https://api.quran.com/api/v4/tafsirs/16/by_ayah/{s}:{a}` responses
 * into plain Arabic Tafsir text.
 */
export function parseQuranComAyahTafsir(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as {
    tafsir?: {
      text?: string;
    };
  };

  const raw = root.tafsir?.text;
  if (typeof raw !== 'string') return null;

  const cleaned = sanitizeTafsirText(raw);
  return cleaned.length > 0 ? cleaned : null;
}
