import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, Bookmark, ReadingProgress } from '../types/quran';
import { SURAHS_LIST } from '../constants/surahsData';
import {
  sanitizeAppSettings,
  sanitizeBookmarks,
  sanitizeReadingProgress,
  parsePositiveIntId,
} from '../utils/securityUtils';

interface QuranSettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  bookmarks: Bookmark[];
  addBookmark: (surahNumber: number, ayahNumber: number, text: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  readingProgress: ReadingProgress | null;
  saveProgress: (surahNumber: number, ayahNumber?: number, page?: number) => void;
  clearHistory: () => void;
  toggleTheme: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  quranFontSize: 28,
  quranFontFamily: 'amiri-quran',
  readingMode: 'mushaf',
  showTajweedMarks: true,
  playbackSpeed: 1,
  defaultReciterId: 102, // Maher Al-Muaiqly
  autoScrollOnPlay: true
};

const QuranSettingsContext = createContext<QuranSettingsContextType | null>(null);

const SETTINGS_KEY = 'holy_quran_settings_v1';
const BOOKMARKS_KEY = 'holy_quran_bookmarks_v1';
const PROGRESS_KEY = 'holy_quran_progress_v1';

export const QuranSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return sanitizeAppSettings(JSON.parse(saved), DEFAULT_SETTINGS);
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      if (saved) return sanitizeBookmarks(JSON.parse(saved));
    } catch {
      // ignore
    }
    return [];
  });

  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const sanitized = sanitizeReadingProgress(JSON.parse(saved));
        if (sanitized) return sanitized;
      }
    } catch {
      // ignore
    }
    // Default initial progress to Surah Al-Fatihah
    return {
      surahNumber: 1,
      surahName: "الفاتحة",
      ayahNumber: 1,
      page: 1,
      updatedAt: Date.now()
    };
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist settings with runtime validation
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = sanitizeAppSettings({ ...prev, ...updates }, prev);
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  // Bookmarks
  const addBookmark = (surahNumber: number, ayahNumber: number, text: string) => {
    const surah = SURAHS_LIST.find((s) => s.number === surahNumber);
    const surahName = surah ? surah.name : `سورة ${surahNumber}`;
    const id = `${surahNumber}_${ayahNumber}`;

    setBookmarks((prev) => {
      // If already bookmarked, don't duplicate
      if (prev.some((b) => b.id === id)) return prev;

      const next = [
        {
          id,
          surahNumber,
          surahName,
          ayahNumber,
          text,
          createdAt: Date.now()
        },
        ...prev
      ];
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    const id = `${surahNumber}_${ayahNumber}`;
    return bookmarks.some((b) => b.id === id);
  };

  // Reading progress
  const saveProgress = (surahNumber: number, ayahNumber = 1, page = 1) => {
    const validSurah = parsePositiveIntId(surahNumber, 1, 114) || 1;
    const validAyah = parsePositiveIntId(ayahNumber, 1, 300) || 1;
    const surah = SURAHS_LIST.find((s) => s.number === validSurah);
    const surahName = surah ? surah.name : `سورة ${validSurah}`;
    const targetPage = parsePositiveIntId(page, 1, 604) || surah?.startPage || 1;

    const progress: ReadingProgress = {
      surahNumber: validSurah,
      surahName,
      ayahNumber: validAyah,
      page: targetPage,
      updatedAt: Date.now()
    };

    setReadingProgress(progress);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  };

  const clearHistory = () => {
    setBookmarks([]);
    setReadingProgress(null);
    try {
      localStorage.removeItem(BOOKMARKS_KEY);
      localStorage.removeItem(PROGRESS_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <QuranSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        readingProgress,
        saveProgress,
        clearHistory,
        toggleTheme
      }}
    >
      {children}
    </QuranSettingsContext.Provider>
  );
};

export const useQuranSettings = () => {
  const context = useContext(QuranSettingsContext);
  if (!context) {
    throw new Error('useQuranSettings must be used within a QuranSettingsProvider');
  }
  return context;
};
