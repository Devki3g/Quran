import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Volume2,
  Sliders,
  LayoutGrid,
  AlignJustify,
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react';
import { fetchSurahWithAyahs } from '../services/quranService';
import { prefetchSurahTafsir } from '../services/tafsirService';
import { SurahDetail } from '../types/quran';
import { SURAHS_LIST } from '../constants/surahsData';
import { SurahHeader } from '../components/quran/SurahHeader';
import { MushafView } from '../components/quran/MushafView';
import { AyahCardView } from '../components/quran/AyahCardView';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useQuranAudio } from '../context/AudioContext';
import { toArabicDigits, downloadSurahAudio, getAudioUrl } from '../utils/quranUtils';
import { parsePositiveIntId } from '../utils/securityUtils';

export const QuranPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surahNumber = parsePositiveIntId(id, 1, 114) || 1;
  const targetAyahParam = parsePositiveIntId(searchParams.get('ayah'), 1, 300);

  const { settings, updateSettings, saveProgress } = useQuranSettings();
  const { playSurah, currentTrack, isPlaying } = useQuranAudio();

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { activeReciter, activeMoshaf } = useQuranAudio();

  const handleDownloadSurah = async () => {
    if (!surah && !currentMeta) return;
    const sName = surah?.name || currentMeta.name;
    const server = activeMoshaf?.server || 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/';
    const url = getAudioUrl(server, surahNumber);
    const rName = activeReciter?.name || 'ماهر المعيقلي';
    setIsDownloading(true);
    await downloadSurahAudio(url, sName, rName);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  // Load Surah
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    setShowSettingsDrawer(false);

    fetchSurahWithAyahs(surahNumber)
      .then((data) => {
        if (mounted) {
          setSurah(data);
          setIsLoading(false);
          const safeTargetAyah =
            targetAyahParam && targetAyahParam <= data.numberOfAyahs ? targetAyahParam : 1;
          saveProgress(surahNumber, safeTargetAyah, data.startPage);
          prefetchSurahTafsir(surahNumber);

          if (targetAyahParam && targetAyahParam <= data.numberOfAyahs) {
            setTimeout(() => {
              const el = document.getElementById(`ayah-${targetAyahParam}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 120);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'تعذر تحميل السورة');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [surahNumber, targetAyahParam]);

  const currentMeta = SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];

  const handlePrevSurah = () => {
    if (surahNumber > 1) {
      navigate(`/quran/${surahNumber - 1}`);
    }
  };

  const handleNextSurah = () => {
    if (surahNumber < 114) {
      navigate(`/quran/${surahNumber + 1}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Top Quran Navigation & Toolbar */}
      <div className="sticky top-16 z-20 bg-white/90 dark:bg-[#121B18]/90 backdrop-blur-md border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3">
        {/* Surah Dropdown Selector */}
        <div className="flex items-center gap-2">
          <select
            value={surahNumber}
            onChange={(e) => navigate(`/quran/${e.target.value}`)}
            aria-label="اختر السورة"
            className="bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] font-ui font-bold text-sm sm:text-base rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#145C46]"
          >
            {SURAHS_LIST.map((s) => (
              <option key={s.number} value={s.number}>
                {toArabicDigits(s.number)}. سورة {s.name} ({toArabicDigits(s.numberOfAyahs)} آية)
              </option>
            ))}
          </select>
        </div>

        {/* Center / Right Toolbar: Audio, Download, View Mode, Font Sizer */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Play Button */}
          <button
            onClick={() => playSurah(surahNumber)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            title="استماع لهذه السورة"
          >
            <Volume2 className="w-4 h-4 text-[#C5A45D]" />
            <span className="hidden sm:inline">
              {currentTrack?.surahNumber === surahNumber && isPlaying ? 'جارٍ الاستماع' : 'استماع'}
            </span>
          </button>

          {/* Download Audio Button */}
          <button
            onClick={handleDownloadSurah}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:text-[#145C46] dark:hover:text-[#C5A45D] text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            title="تحميل السورة استماع بصيغة MP3"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#145C46] dark:text-[#C5A45D]" />
            ) : (
              <Download className="w-4 h-4 text-[#145C46] dark:text-[#C5A45D]" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? 'جارٍ التحميل' : 'تحميل'}
            </span>
          </button>

          {/* Reading Mode Toggle (Mushaf vs Ayahs) */}
          <div className="hidden sm:flex items-center bg-[#FAFAF6] dark:bg-[#1E2D27] p-1 rounded-xl border border-[#E2E8E1] dark:border-[#24352D]">
            <button
              onClick={() => updateSettings({ readingMode: 'mushaf' })}
              title="نمط المصحف المتصل"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                settings.readingMode === 'mushaf'
                  ? 'bg-white dark:bg-[#145C46] text-[#145C46] dark:text-white font-bold shadow-xs'
                  : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
              }`}
            >
              <AlignJustify className="w-4 h-4" />
              <span>مصحف</span>
            </button>
            <button
              onClick={() => updateSettings({ readingMode: 'ayahs' })}
              title="نمط الآيات المنفصلة"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                settings.readingMode === 'ayahs'
                  ? 'bg-white dark:bg-[#145C46] text-[#145C46] dark:text-white font-bold shadow-xs'
                  : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>آيات</span>
            </button>
          </div>

          {/* Font & Appearance Drawer Toggle */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="تخصيص الخط وحجم القراءة"
            className="p-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:text-[#145C46] dark:hover:text-[#C5A45D] transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Customizer Drawer */}
      {showSettingsDrawer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-lg animate-in slide-in-from-top-2 duration-150 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E1] dark:border-[#24352D]">
            <span className="font-bold text-sm text-[#145C46] dark:text-[#C5A45D] font-ui">
              خيارات خط وقراءة المصحف
            </span>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-xs text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size Adjuster */}
            <div>
              <div className="flex justify-between text-xs text-[#777F79] dark:text-[#95A39B] mb-2 font-ui">
                <span>حجم خط المصحف</span>
                <span className="font-bold text-[#145C46] dark:text-[#C5A45D]">
                  {settings.quranFontSize} بكسل
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateSettings({ quranFontSize: Math.max(18, settings.quranFontSize - 2) })
                  }
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min="20"
                  max="44"
                  step="2"
                  value={settings.quranFontSize}
                  onChange={(e) => updateSettings({ quranFontSize: Number(e.target.value) })}
                  className="w-full accent-[#145C46] dark:accent-[#C5A45D]"
                />
                <button
                  onClick={() =>
                    updateSettings({ quranFontSize: Math.min(44, settings.quranFontSize + 2) })
                  }
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Font Family Selector */}
            <div>
              <span className="text-xs text-[#777F79] dark:text-[#95A39B] mb-2 block font-ui">
                نوع الخط القرآني
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'amiri-quran', label: 'الخط القرآني (العثماني)' },
                  { id: 'amiri', label: 'خط الأميري' },
                  { id: 'cairo', label: 'خط القاهرة (واضح)' },
                  { id: 'tajawal', label: 'خط تجوال (عصري)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSettings({ quranFontFamily: f.id as any })}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      settings.quranFontFamily === f.id
                        ? 'bg-[#145C46] text-white font-bold'
                        : 'bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#242B28] dark:text-gray-300 border border-[#E2E8E1] dark:border-[#24352D]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surah Header Ornamental Banner */}
      <SurahHeader surah={surah || currentMeta} />

      {/* Loading State */}
      {isLoading && (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#145C46] dark:text-[#C5A45D] mx-auto" />
          <p className="text-base font-bold text-[#145C46] dark:text-[#C5A45D] font-ui">
            جارٍ تحميل سورة {currentMeta.name}...
          </p>
          <p className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
            يتم استرداد النص القرآني المعتمد بالرسم العثماني
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-bold text-lg text-red-800 dark:text-red-200 font-ui">
            تعذر تحميل آيات السورة
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 font-ui">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-[#145C46] text-white text-sm font-semibold hover:bg-[#1E7558] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Main Quran Content (Mushaf View vs Ayahs View) */}
      {!isLoading && surah && (
        <>
          {settings.readingMode === 'mushaf' ? (
            <MushafView
              surah={surah}
              fontSize={settings.quranFontSize}
              fontFamily={settings.quranFontFamily}
            />
          ) : (
            <AyahCardView
              surah={surah}
              fontSize={settings.quranFontSize}
              fontFamily={settings.quranFontFamily}
            />
          )}

          {/* Surah Bottom Navigation: Previous & Next Surah Buttons */}
          <div className="pt-8 border-t border-[#E2E8E1] dark:border-[#24352D] flex items-center justify-between gap-4 font-ui">
            {surahNumber > 1 ? (
              <button
                onClick={handlePrevSurah}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46] text-[#242B28] dark:text-[#F0F5F2] font-semibold text-sm transition-all"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                <span>السورة السابقة ({SURAHS_LIST[surahNumber - 2]?.name})</span>
              </button>
            ) : (
              <div />
            )}

            {surahNumber < 114 ? (
              <button
                onClick={handleNextSurah}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#145C46] hover:bg-[#1E7558] text-white font-semibold text-sm shadow-md transition-all"
              >
                <span>السورة التالية ({SURAHS_LIST[surahNumber]?.name})</span>
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </>
      )}
    </div>
  );
};
