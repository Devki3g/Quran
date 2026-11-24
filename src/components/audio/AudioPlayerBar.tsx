import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Gauge,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  X,
  ListMusic,
  Download,
  Check
} from 'lucide-react';
import { useQuranAudio } from '../../context/AudioContext';
import { formatAudioTime, toArabicDigits, downloadSurahAudio } from '../../utils/quranUtils';
import { SURAHS_LIST } from '../../constants/surahsData';

export const AudioPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isRepeating,
    error,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleRepeat,
    playNextSurah,
    playPrevSurah,
    playSurah
  } = useQuranAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSurahDrawer, setShowSurahDrawer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!showSurahDrawer && !isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSurahDrawer(false);
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSurahDrawer, isExpanded]);

  const handleDownload = async () => {
    if (!currentTrack) return;
    setIsDownloading(true);
    await downloadSurahAudio(currentTrack.audioUrl, currentTrack.surahName, currentTrack.reciterName);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  // If no track has ever been loaded, keep a compact "Play Quran" banner or minimal bar
  if (!currentTrack) {
    return null;
  }

  const speedOptions = [0.75, 1, 1.25, 1.5];

  const handleSpeedCycle = () => {
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setPlaybackRate(speedOptions[nextIndex]);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Persistent Bottom Audio Player Bar */}
      <aside 
        aria-label="مشغل التلاوات القرآنية"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#141C18]/95 backdrop-blur-md border-t border-[#E2E8E1] dark:border-[#24352D] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all"
      >
        {/* Progress Seek Bar (Top edge of bar) */}
        <div className="relative w-full h-1.5 bg-[#E5EAE4] dark:bg-[#24352D] group cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-[#145C46] to-[#C5A45D] transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="شريط التقدم الزمني للتلاوة"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Left / Info: Surah & Reciter Details */}
          <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#145C46] to-[#1E7558] text-[#C5A45D] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {toArabicDigits(currentTrack.surahNumber)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-[#242B28] dark:text-[#F0F5F2] truncate font-ui">
                  سورة {currentTrack.surahName}
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-medium">
                  {currentTrack.moshafName}
                </span>
              </div>
              <p className="text-xs text-[#777F79] dark:text-[#95A39B] truncate font-ui">
                القارئ {currentTrack.reciterName}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Repeat button */}
              <button
                onClick={toggleRepeat}
                title={isRepeating ? 'تكرار السورة: مفعّل' : 'تكرار السورة: معطّل'}
                aria-label="تكرار السورة"
                className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
                  isRepeating
                    ? 'text-[#145C46] dark:text-[#C5A45D] bg-[#145C46]/10 dark:bg-[#C5A45D]/15 font-bold'
                    : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Prev Surah (Next in Arabic RTL) */}
              <button
                onClick={playPrevSurah}
                title="السورة السابقة"
                aria-label="السورة السابقة"
                className="p-1.5 rounded-lg text-[#242B28] dark:text-[#F0F5F2] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] transition-colors"
              >
                <SkipForward className="w-5 h-5 rtl:rotate-180" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlayPause}
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#145C46] hover:bg-[#1E7558] text-white flex items-center justify-center shadow-md shadow-[#145C46]/30 hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-white ms-0.5" />
                )}
              </button>

              {/* Next Surah (Prev in Arabic RTL) */}
              <button
                onClick={playNextSurah}
                title="السورة التالية"
                aria-label="السورة التالية"
                className="p-1.5 rounded-lg text-[#242B28] dark:text-[#F0F5F2] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] transition-colors"
              >
                <SkipBack className="w-5 h-5 rtl:rotate-180" />
              </button>

              {/* Speed rate button */}
              <button
                onClick={handleSpeedCycle}
                title={`سرعة التلاوة: ${playbackRate}x`}
                aria-label="سرعة التلاوة"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27]"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{playbackRate}x</span>
              </button>
            </div>

            {/* Time labels */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#777F79] dark:text-[#95A39B] font-mono">
              <span>{formatAudioTime(currentTime)}</span>
              <span>/</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume & Drawer Tools */}
          <div className="flex items-center gap-2">
            {/* Volume Control */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                className="p-1.5 rounded-lg text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D]"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="مستوى الصوت"
                className="w-16 h-1 bg-[#E2E8E1] dark:bg-[#283731] accent-[#145C46] dark:accent-[#C5A45D] rounded cursor-pointer"
              />
            </div>

            {/* Download MP3 Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              title={`تحميل سورة ${currentTrack.surahName} بصوت ${currentTrack.reciterName}`}
              aria-label="تحميل السورة بصيغة MP3"
              className="p-2 rounded-xl text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#145C46] dark:text-[#C5A45D]" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Surah Drawer Toggle */}
            <button
              onClick={() => setShowSurahDrawer(true)}
              title="قائمة سور المصحف"
              aria-label="قائمة السور"
              className="p-2 rounded-xl text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] transition-colors"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Expand / Modal Full Player */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title="عرض المشغل الكامل"
              aria-label="تكبير المشغل"
              className="p-2 rounded-xl text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border-t border-red-200 dark:border-red-900/50 px-4 py-2 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => playSurah(currentTrack.surahNumber)}
              className="underline font-bold hover:text-red-900 dark:hover:text-red-100"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </aside>

      {/* Quick Surahs Audio Drawer */}
      {showSurahDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
          onClick={() => setShowSurahDrawer(false)}
          role="dialog"
          aria-modal="true"
          aria-label="قائمة السور للاستماع"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#16221E] h-full shadow-2xl flex flex-col border-s border-[#E2E8E1] dark:border-[#24352D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E2E8E1] dark:border-[#24352D] flex items-center justify-between bg-[#FAFAF6] dark:bg-[#121B18]">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
                <h3 className="font-bold text-base text-[#242B28] dark:text-[#F0F5F2] font-ui">
                  قائمة السور للاستماع
                </h3>
              </div>
              <button
                onClick={() => setShowSurahDrawer(false)}
                className="p-1 rounded-lg text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 divide-y divide-[#E2E8E1]/40 dark:divide-[#24352D]/40">
              {SURAHS_LIST.map((surah) => {
                const isSelected = currentTrack?.surahNumber === surah.number;
                return (
                  <button
                    key={surah.number}
                    onClick={() => {
                      playSurah(surah.number);
                      setShowSurahDrawer(false);
                    }}
                    className={`w-full text-right p-3 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-bold'
                        : 'text-[#242B28] dark:text-[#F0F5F2] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center font-bold">
                        {toArabicDigits(surah.number)}
                      </span>
                      <div>
                        <div className="text-sm font-ui">سورة {surah.name}</div>
                        <div className="text-[11px] text-[#777F79] dark:text-[#95A39B]">
                          {toArabicDigits(surah.numberOfAyahs)} آية
                        </div>
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <span className="flex items-center gap-1 text-xs text-[#145C46] dark:text-[#C5A45D]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>جارٍ التشغيل</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Player Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setIsExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="المشغل الصوتي الكامل"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 left-4 p-2 rounded-xl text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Islamic Quran Vinyl / Emblem Cover */}
            <div className="w-48 h-48 rounded-3xl bg-gradient-to-tr from-[#0D3F30] via-[#145C46] to-[#1E7558] text-[#C5A45D] flex flex-col items-center justify-center p-6 shadow-xl border-4 border-[#C5A45D]/30 my-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-islamic-pattern opacity-30" />
              <div className="w-16 h-16 rounded-full bg-[#C5A45D]/20 flex items-center justify-center mb-3">
                <Play className="w-8 h-8 fill-[#C5A45D] ms-1 text-[#C5A45D]" />
              </div>
              <h3 className="font-bold text-2xl text-white font-ui z-10">
                سورة {currentTrack.surahName}
              </h3>
              <p className="text-xs text-[#EAD69E] z-10 mt-1">
                رقم السورة: {toArabicDigits(currentTrack.surahNumber)}
              </p>
            </div>

            {/* Reciter & Moshaf */}
            <h4 className="font-bold text-xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
              القارئ {currentTrack.reciterName}
            </h4>
            <p className="text-xs text-[#777F79] dark:text-[#95A39B] mt-1 font-ui">
              {currentTrack.moshafName}
            </p>

            {/* Large Seek Bar */}
            <div className="w-full mt-6 mb-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="التقدم الزمني"
                className="w-full h-2 bg-[#E2E8E1] dark:bg-[#283731] accent-[#145C46] dark:accent-[#C5A45D] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[#777F79] dark:text-[#95A39B] font-mono mt-1">
                <span>{formatAudioTime(currentTime)}</span>
                <span>{formatAudioTime(duration)}</span>
              </div>
            </div>

            {/* Large Controls */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <button
                onClick={toggleRepeat}
                className={`p-2.5 rounded-xl ${
                  isRepeating ? 'text-[#145C46] dark:text-[#C5A45D] bg-[#145C46]/10' : 'text-[#777F79]'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>

              <button
                onClick={playPrevSurah}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#242B28] dark:text-white"
              >
                <SkipForward className="w-6 h-6 rtl:rotate-180" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-[#145C46] hover:bg-[#1E7558] text-white flex items-center justify-center shadow-lg shadow-[#145C46]/30 hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 fill-white ms-1" />
                )}
              </button>

              <button
                onClick={playNextSurah}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#242B28] dark:text-white"
              >
                <SkipBack className="w-6 h-6 rtl:rotate-180" />
              </button>

              <button
                onClick={handleSpeedCycle}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#777F79] hover:text-[#145C46] bg-gray-100 dark:bg-gray-800"
              >
                {playbackRate}x
              </button>
            </div>

            {/* Download Button in Modal */}
            <div className="w-full mt-6 pt-4 border-t border-[#E2E8E1] dark:border-[#24352D]">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#145C46] hover:bg-[#1E7558] text-white text-sm font-semibold transition-all shadow-md"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ تحميل ملف السورة MP3...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#C5A45D]" />
                    <span>تحميل تلاوة السورة (MP3)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
