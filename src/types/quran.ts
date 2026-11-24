export type RevelationType = 'Meccan' | 'Medinan' | 'مكية' | 'مدنية';

export interface SurahMeta {
  number: number;
  name: string; // Arabic name e.g. الفاتحة
  englishName: string; // Transliterated name e.g. Al-Faatiha
  englishNameTranslation: string; // e.g. The Opening
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startPage: number;
  juz: number;
}

export interface Ayah {
  number: number; // Global number 1..6236
  text: string; // Uthmani Arabic text
  numberInSurah: number; // 1..N
  juz: number;
  page: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  moshaf_type?: number;
  surah_list: string; // Comma separated list of available surah numbers
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

export interface AudioTrack {
  surahNumber: number;
  surahName: string;
  reciterId: number;
  reciterName: string;
  moshafName: string;
  serverUrl: string;
  audioUrl: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  createdAt: number;
}

export interface ReadingProgress {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  page: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  quranFontSize: number; // in pixels, default 28
  quranFontFamily: 'amiri-quran' | 'amiri' | 'cairo' | 'tajawal';
  readingMode: 'mushaf' | 'ayahs';
  showTajweedMarks: boolean;
  playbackSpeed: number;
  defaultReciterId: number;
  autoScrollOnPlay: boolean;
}

export type DhikrCategoryKey = 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'wake';

export interface DhikrItem {
  id: string;
  category: DhikrCategoryKey;
  text: string;
  count: number; // e.g. 1, 3, 7, 33, 100
  fadl?: string; // Virtue
  source?: string; // Hadith source e.g. صحيح البخاري
}

export type SurahTafsirMap = Record<number, string>;

