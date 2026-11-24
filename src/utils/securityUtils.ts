import {
  AppSettings,
  AudioTrack,
  Bookmark,
  Moshaf,
  ReadingProgress,
  Reciter,
  SurahTafsirMap,
} from '../types/quran';
import { sanitizeTafsirText } from './tafsirUtils';

const ALLOWED_AUDIO_HOST_SUFFIXES = ['mp3quran.net'];
const ALLOWED_THEMES = new Set(['light', 'dark', 'system']);
const ALLOWED_FONTS = new Set(['amiri-quran', 'amiri', 'cairo', 'tajawal']);
const ALLOWED_READING_MODES = new Set(['mushaf', 'ayahs']);
const ALLOWED_SPEEDS = new Set([0.75, 1, 1.25, 1.5]);

/**
 * Strictly parses a positive integer within [min, max] from untrusted route/query input.
 * Rejects partial numeric strings like "18abc" or floats like "1.5".
 */
export function parsePositiveIntId(raw: unknown, min: number, max: number): number | null {
  if (typeof raw === 'number') {
    if (!Number.isInteger(raw) || raw < min || raw > max) return null;
    return raw;
  }
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

/**
 * Validates and normalizes an external HTTPS URL against an allowlist of trusted domain suffixes.
 * Upgrades http:// to https:// for allowlisted hosts and rejects javascript:, data:, credentials,
 * control characters, or non-allowlisted hosts.
 */
export function sanitizeExternalUrl(
  rawUrl: unknown,
  allowedHostSuffixes: string[] = ALLOWED_AUDIO_HOST_SUFFIXES
): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048 || /[\s\u0000-\u001F\u007F]/.test(trimmed)) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.username || parsed.password) {
    return null;
  }

  if (parsed.protocol === 'http:') {
    parsed.protocol = 'https:';
  }

  if (parsed.protocol !== 'https:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const isAllowedHost = allowedHostSuffixes.some((suffix) => {
    const cleanSuffix = suffix.toLowerCase();
    return host === cleanSuffix || host.endsWith(`.${cleanSuffix}`);
  });

  if (!isAllowedHost) {
    return null;
  }

  return parsed.toString();
}

export function isExcludedReciterRecord(reciter: { id?: unknown; name?: unknown }): boolean {
  const name = typeof reciter.name === 'string' ? reciter.name : '';
  return (
    reciter.id === 123 ||
    reciter.id === 54 ||
    name.includes('مشاري') ||
    name.includes('العفاسي')
  );
}

/**
 * Sanitizes AppSettings loaded from localStorage against schema & bounds.
 */
export function sanitizeAppSettings(raw: unknown, fallback: AppSettings): AppSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }

  const record = raw as Record<string, unknown>;
  const theme =
    typeof record.theme === 'string' && ALLOWED_THEMES.has(record.theme)
      ? (record.theme as AppSettings['theme'])
      : fallback.theme;

  const quranFontSize =
    typeof record.quranFontSize === 'number' && Number.isFinite(record.quranFontSize)
      ? Math.min(44, Math.max(18, Math.round(record.quranFontSize)))
      : fallback.quranFontSize;

  const quranFontFamily =
    typeof record.quranFontFamily === 'string' && ALLOWED_FONTS.has(record.quranFontFamily)
      ? (record.quranFontFamily as AppSettings['quranFontFamily'])
      : fallback.quranFontFamily;

  const readingMode =
    typeof record.readingMode === 'string' && ALLOWED_READING_MODES.has(record.readingMode)
      ? (record.readingMode as AppSettings['readingMode'])
      : fallback.readingMode;

  const playbackSpeed =
    typeof record.playbackSpeed === 'number' && ALLOWED_SPEEDS.has(record.playbackSpeed)
      ? record.playbackSpeed
      : fallback.playbackSpeed;

  const parsedReciterId = parsePositiveIntId(record.defaultReciterId, 1, 999999);
  const defaultReciterId =
    parsedReciterId && parsedReciterId !== 54 && parsedReciterId !== 123
      ? parsedReciterId
      : fallback.defaultReciterId;

  return {
    theme,
    quranFontSize,
    quranFontFamily,
    readingMode,
    showTajweedMarks:
      typeof record.showTajweedMarks === 'boolean'
        ? record.showTajweedMarks
        : fallback.showTajweedMarks,
    playbackSpeed,
    defaultReciterId,
    autoScrollOnPlay:
      typeof record.autoScrollOnPlay === 'boolean'
        ? record.autoScrollOnPlay
        : fallback.autoScrollOnPlay,
  };
}

/**
 * Validates and sanitizes Bookmarks loaded from localStorage.
 */
export function sanitizeBookmarks(raw: unknown): Bookmark[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const clean: Bookmark[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const b = item as Record<string, unknown>;

    const surahNumber = parsePositiveIntId(b.surahNumber, 1, 114);
    const ayahNumber = parsePositiveIntId(b.ayahNumber, 1, 300);
    if (!surahNumber || !ayahNumber) continue;

    if (typeof b.surahName !== 'string' || typeof b.text !== 'string') continue;
    const surahName = b.surahName.trim().slice(0, 80);
    const text = b.text.trim().slice(0, 4000);
    if (!surahName || !text) continue;

    const id = `${surahNumber}_${ayahNumber}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const createdAt =
      typeof b.createdAt === 'number' && Number.isFinite(b.createdAt) && b.createdAt > 0
        ? b.createdAt
        : Date.now();

    clean.push({
      id,
      surahNumber,
      surahName,
      ayahNumber,
      text,
      createdAt,
    });
  }

  return clean;
}

/**
 * Validates and sanitizes ReadingProgress loaded from localStorage.
 */
export function sanitizeReadingProgress(raw: unknown): ReadingProgress | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const surahNumber = parsePositiveIntId(r.surahNumber, 1, 114);
  const ayahNumber = parsePositiveIntId(r.ayahNumber, 1, 300);
  const page = parsePositiveIntId(r.page, 1, 604);
  if (!surahNumber || !ayahNumber || !page) return null;

  if (typeof r.surahName !== 'string' || !r.surahName.trim()) return null;

  return {
    surahNumber,
    surahName: r.surahName.trim().slice(0, 80),
    ayahNumber,
    page,
    updatedAt:
      typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt) && r.updatedAt > 0
        ? r.updatedAt
        : Date.now(),
  };
}

/**
 * Validates and sanitizes recent AudioTrack entries, enforcing trusted audio URLs
 * and reciter exclusions.
 */
export function sanitizeAudioTracks(raw: unknown): AudioTrack[] {
  if (!Array.isArray(raw)) return [];

  const clean: AudioTrack[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const t = item as Record<string, unknown>;

    const surahNumber = parsePositiveIntId(t.surahNumber, 1, 114);
    const reciterId = parsePositiveIntId(t.reciterId, 1, 999999);
    if (!surahNumber || !reciterId) continue;

    if (
      typeof t.surahName !== 'string' ||
      typeof t.reciterName !== 'string' ||
      typeof t.moshafName !== 'string'
    ) {
      continue;
    }

    if (isExcludedReciterRecord({ id: reciterId, name: t.reciterName })) {
      continue;
    }

    const serverUrl = sanitizeExternalUrl(t.serverUrl);
    const audioUrl = sanitizeExternalUrl(t.audioUrl);
    if (!serverUrl || !audioUrl) continue;

    clean.push({
      surahNumber,
      surahName: t.surahName.trim().slice(0, 80),
      reciterId,
      reciterName: t.reciterName.trim().slice(0, 120),
      moshafName: t.moshafName.trim().slice(0, 120),
      serverUrl,
      audioUrl,
    });
  }

  return clean.slice(0, 10);
}

/**
 * Validates Reciter & Moshaf records from API or cache, enforcing trusted HTTPS server URLs
 * and excluding blocked reciters.
 */
export function sanitizeReciterList(raw: unknown): Reciter[] {
  if (!Array.isArray(raw)) return [];

  const clean: Reciter[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const r = item as Record<string, unknown>;
    const id = parsePositiveIntId(r.id, 1, 999999);
    if (!id || typeof r.name !== 'string' || !r.name.trim()) continue;
    if (isExcludedReciterRecord({ id, name: r.name })) continue;
    if (!Array.isArray(r.moshaf)) continue;

    const validMoshafs: Moshaf[] = [];
    for (const mItem of r.moshaf) {
      if (!mItem || typeof mItem !== 'object' || Array.isArray(mItem)) continue;
      const m = mItem as Record<string, unknown>;
      const mId = parsePositiveIntId(m.id, 1, 999999);
      const safeServer = sanitizeExternalUrl(m.server);
      if (!mId || !safeServer || typeof m.name !== 'string') continue;

      validMoshafs.push({
        id: mId,
        name: m.name.trim().slice(0, 140),
        server: safeServer,
        surah_total:
          typeof m.surah_total === 'number' && Number.isFinite(m.surah_total)
            ? Math.max(0, Math.min(114, m.surah_total))
            : 114,
        moshaf_type: typeof m.moshaf_type === 'number' ? m.moshaf_type : undefined,
        surah_list: typeof m.surah_list === 'string' ? m.surah_list : '',
      });
    }

    if (r.moshaf.length > 0 && validMoshafs.length === 0) continue;

    clean.push({
      id,
      name: r.name.trim().slice(0, 140),
      letter: typeof r.letter === 'string' ? r.letter.trim().slice(0, 4) : 'ق',
      moshaf: validMoshafs,
    });
  }

  return clean;
}

/**
 * Validates Azkar counter map loaded from localStorage, ignoring prototype-pollution keys
 * and clamping values to non-negative integers.
 */
export function sanitizeAzkarCounts(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const result: Record<string, number> = Object.create(null);
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) continue;
    if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 1000) {
      result[key] = val;
    }
  }
  return { ...result };
}

/**
 * Validates and re-sanitizes cached Tafsir maps loaded from localStorage.
 */
export function sanitizeCachedTafsirMap(raw: unknown): SurahTafsirMap | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const clean: SurahTafsirMap = {};

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const ayahNum = parsePositiveIntId(key, 1, 300);
    if (!ayahNum || typeof val !== 'string') continue;
    const text = sanitizeTafsirText(val);
    if (text) {
      clean[ayahNum] = text;
    }
  }

  return Object.keys(clean).length > 0 ? clean : null;
}

/**
 * Safely copies text to the clipboard without throwing unhandled promise rejections.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  } catch {
    // ignore
  }
  return false;
}
