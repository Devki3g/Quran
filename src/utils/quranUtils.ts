import { SurahMeta } from '../types/quran';
import { sanitizeExternalUrl, parsePositiveIntId } from './securityUtils';

/**
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export function toArabicDigits(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
}

/**
 * Formats an ayah number marker with traditional decorative brackets
 */
export function formatAyahMarker(ayahNumber: number): string {
  return `﴿${toArabicDigits(ayahNumber)}﴾`;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Builds the standard MP3Quran CDN audio URL for a given Surah with strict URL validation
 */
export function getAudioUrl(serverUrl: string, surahNumber: number): string {
  const validSurah = parsePositiveIntId(surahNumber, 1, 114) || 1;
  const safeServer = sanitizeExternalUrl(serverUrl);
  if (!safeServer) return '';
  const cleanServer = safeServer.endsWith('/') ? safeServer : `${safeServer}/`;
  const formattedNumber = String(validSurah).padStart(3, '0');
  return `${cleanServer}${formattedNumber}.mp3`;
}

/**
 * Normalizes Arabic text for flexible searching:
 * - Removes tashkeel / diacritics
 * - Normalizes Alef variations (أ، إ، آ -> ا)
 * - Normalizes Taa Marbutah (ة -> ه)
 * - Normalizes Yaa (ى -> ي)
 * - Removes Tatweel / Kashida (_)
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / tashkeel (Fat-ha, Damma, Kasra, Sukun, Shadda, etc.)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Normalize Alef
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbutah
    .replace(/ة/g, 'ه')
    // Normalize Yaa
    .replace(/ى/g, 'ي')
    // Remove tatweel
    .replace(/ـ/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Filters Surahs based on a search query (Arabic name, English name, or Surah number)
 */
export function searchSurahs(query: string, surahs: SurahMeta[]): SurahMeta[] {
  const trimmed = query.trim();
  if (!trimmed) return surahs;

  const normalizedQuery = normalizeArabicText(trimmed);
  const numericQuery = parseInt(trimmed, 10);

  return surahs.filter((surah) => {
    if (!isNaN(numericQuery) && surah.number === numericQuery) {
      return true;
    }
    const normalizedName = normalizeArabicText(surah.name);
    const normalizedEngName = surah.englishName.toLowerCase();
    const normalizedEngTrans = surah.englishNameTranslation.toLowerCase();

    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedEngName.includes(trimmed.toLowerCase()) ||
      normalizedEngTrans.includes(trimmed.toLowerCase())
    );
  });
}

/**
 * Returns the Arabic label for the revelation place
 */
export function getRevelationTypeArabic(type: 'Meccan' | 'Medinan' | string): string {
  return type === 'Meccan' || type === 'مكية' ? 'مكية' : 'مدنية';
}

/**
 * Triggers download of a Surah MP3 recitation safely after verifying audio URL origin
 */
export async function downloadSurahAudio(audioUrl: string, surahName: string, reciterName: string): Promise<boolean> {
  const safeAudioUrl = sanitizeExternalUrl(audioUrl);
  if (!safeAudioUrl) return false;

  const safeSurahName = surahName.replace(/[^\u0621-\u064A0-9a-zA-Z]/g, '_').slice(0, 60);
  const safeReciterName = reciterName.replace(/[^\u0621-\u064A0-9a-zA-Z]/g, '_').slice(0, 60);
  const fileName = `سورة_${safeSurahName}_القارئ_${safeReciterName}.mp3`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(safeAudioUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    return true;
  } catch {
    // Direct link fallback using strictly validated URL
    const a = document.createElement('a');
    a.href = safeAudioUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}

