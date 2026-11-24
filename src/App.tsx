import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuranSettingsProvider } from './context/QuranSettingsContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AudioPlayerBar } from './components/audio/AudioPlayerBar';
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { SurahsPage } from './pages/SurahsPage';
import { RecitersPage } from './pages/RecitersPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { AzkarPage } from './pages/AzkarPage';

export default function App() {
  return (
    <BrowserRouter>
      <QuranSettingsProvider>
        <AudioProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFAF6] dark:bg-[#0E1613] text-[#242B28] dark:text-[#F0F5F2] font-ui transition-colors selection:bg-[#C5A45D]/30 selection:text-[#145C46]">
            {/* Main Application Navbar */}
            <Navbar />

            {/* Page Contents */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quran" element={<Navigate to="/quran/1" replace />} />
                <Route path="/quran/:id" element={<QuranPage />} />
                <Route path="/surahs" element={<SurahsPage />} />
                <Route path="/reciters" element={<RecitersPage />} />
                <Route path="/azkar" element={<AzkarPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Islamic Footer */}
            <Footer />

            {/* Persistent Audio Player Bar */}
            <AudioPlayerBar />
          </div>
        </AudioProvider>
      </QuranSettingsProvider>
    </BrowserRouter>
  );
}
