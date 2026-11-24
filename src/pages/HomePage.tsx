import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Volume2,
  Clock,
  ArrowLeft,
  Play,
  Share2,
  Copy,
  Check,
  Headphones
} from 'lucide-react';
import { AzkarTasbihIcon, MushafStandIcon } from '../components/icons/IslamicIcons';
import { PageHeader } from '../components/common/PageHeader';
import { useQuranAudio } from '../context/AudioContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { getDailyVerse } from '../services/quranService';
import { POPULAR_RECITERS } from '../constants/popularReciters';
import { SURAHS_LIST, TOTAL_SURAHS, TOTAL_AYAHS, TOTAL_JUZ } from '../constants/surahsData';
import { toArabicDigits, getRevelationTypeArabic } from '../utils/quranUtils';
import { safeCopyToClipboard } from '../utils/securityUtils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { playSurah, isPlaying, currentTrack, recentTracks } = useQuranAudio();
  const { readingProgress } = useQuranSettings();
  const [copiedDaily, setCopiedDaily] = React.useState(false);

  const dailyVerse = useMemo(() => getDailyVerse(), []);

  const handleCopyDaily = async () => {
    const text = `﴿${dailyVerse.text}﴾ [سورة ${dailyVerse.surahName}: الآية ${toArabicDigits(dailyVerse.ayahNumber)}]`;
    const ok = await safeCopyToClipboard(text);
    if (ok) {
      setCopiedDaily(true);
      setTimeout(() => setCopiedDaily(false), 2000);
    }
  };

  const handleShareDaily = async () => {
    const text = `﴿${dailyVerse.text}﴾ [سورة ${dailyVerse.surahName}: الآية ${toArabicDigits(dailyVerse.ayahNumber)}]`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `آية اليوم - سورة ${dailyVerse.surahName}`,
          text,
          url: window.location.href
        });
      } catch (e) {
        // ignore
      }
    } else {
      handleCopyDaily();
    }
  };

  const famousSurahs = [
    SURAHS_LIST[0], // Al-Fatihah
    SURAHS_LIST[1], // Al-Baqarah
    SURAHS_LIST[17], // Al-Kahf
    SURAHS_LIST[35], // Yaseen
    SURAHS_LIST[54], // Ar-Rahman
    SURAHS_LIST[55], // Al-Waqi'ah
    SURAHS_LIST[66], // Al-Mulk
    SURAHS_LIST[111] // Al-Ikhlas
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. Hero Section */}
      <PageHeader
        icon
        kicker="المصحف الشريف برواية حفص عن عاصم"
        title="الْقُرْآنُ الْكَرِيمُ"
        subtitle="كتاب الله نور القلوب وهداية الأرواح.. تلاوة عذبة، قراءة متصلة بنمط المصحف، وتدبر لآيات الذكر الحكيم."
      >
        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-ui">
          <button
            onClick={() => navigate(readingProgress ? `/quran/${readingProgress.surahNumber}` : '/quran/1')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#145C46] hover:bg-[#1E7558] text-white font-bold text-base shadow-md shadow-[#145C46]/15 hover:scale-[1.02] transition-all"
          >
            <BookOpen className="w-5 h-5 text-[#C5A45D]" />
            <span>ابدأ القراءة الآن</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={() => playSurah(1)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#1E2D27] hover:bg-[#F2F4F0] dark:hover:bg-[#24352D] text-[#242B28] dark:text-[#F0F5F2] font-medium text-base border border-[#E2E8E1] dark:border-[#24352D] transition-colors"
          >
            <Volume2 className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <span>استمع لسورة الفاتحة</span>
          </button>

          <button
            onClick={() => navigate('/azkar')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#1E2D27] hover:bg-[#F2F4F0] dark:hover:bg-[#24352D] text-[#242B28] dark:text-[#F0F5F2] font-medium text-base border border-[#E2E8E1] dark:border-[#24352D] transition-colors"
          >
            <AzkarTasbihIcon className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <span>أذكار المسلم</span>
          </button>
        </div>

        {/* Key Quran Stats */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-[#E2E8E1] dark:border-[#24352D]">
          <div className="p-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1] dark:border-[#24352D]">
            <div className="font-bold text-2xl text-[#145C46] dark:text-[#C5A45D] font-ui tabular-nums">{toArabicDigits(TOTAL_SURAHS)}</div>
            <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">سورة كريمة</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1] dark:border-[#24352D]">
            <div className="font-bold text-2xl text-[#145C46] dark:text-[#C5A45D] font-ui tabular-nums">{toArabicDigits(TOTAL_JUZ)}</div>
            <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">جزءاً شريفاً</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1] dark:border-[#24352D]">
            <div className="font-bold text-2xl text-[#145C46] dark:text-[#C5A45D] font-ui tabular-nums">{toArabicDigits(TOTAL_AYAHS)}</div>
            <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">آية بينة</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1] dark:border-[#24352D]">
            <div className="font-bold text-2xl text-[#145C46] dark:text-[#C5A45D] font-ui tabular-nums">100+</div>
            <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">قارئ  </div>
          </div>
        </div>
      </PageHeader>

      {/* 2. Continue Reading Card (if user has progress) */}
      {readingProgress && (
        <section className="bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-12 h-12 rounded-2xl bg-[#145C46] text-[#C5A45D] flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">آخر موضع قراءة محفوظ</div>
              <div className="font-bold text-lg sm:text-xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
                سورة {readingProgress.surahName} • صفحة {toArabicDigits(readingProgress.page)}
              </div>
              <div className="text-xs text-[#145C46] dark:text-[#C5A45D] font-ui">
                الآية {toArabicDigits(readingProgress.ayahNumber)}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/quran/${readingProgress.surahNumber}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white font-semibold text-sm shadow-sm transition-all shrink-0"
          >
            <span>متابعة القراءة</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        </section>
      )}

      {/* 3. Daily Quran Verse Section */}
      <section className="bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2E8E1] dark:border-[#24352D] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A45D]" />
            <h2 className="font-bold text-lg text-[#145C46] dark:text-[#C5A45D] font-ui">
              آية اليوم وتدبرها
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-medium font-ui">
            سورة {dailyVerse.surahName} [الآية {toArabicDigits(dailyVerse.ayahNumber)}]
          </span>
        </div>

        {/* Verse Calligraphy Text */}
        <div className="text-center py-4 px-2 sm:px-8">
          <p className="font-quran text-2xl sm:text-3xl lg:text-4xl text-[#242B28] dark:text-[#F0F5F2] leading-loose">
            ﴿ {dailyVerse.text} ﴾
          </p>
          <div className="mt-4 p-4 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1]/80 dark:border-[#24352D] max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#145C46] dark:text-[#C5A45D] block mb-1">إشراقة وتدبر:</span>
            <p className="text-sm text-[#777F79] dark:text-[#95A39B] leading-relaxed font-ui">
              {dailyVerse.reflection}
            </p>
          </div>
        </div>

        {/* Verse Actions */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 mt-4 text-xs font-ui">
          <button
            onClick={() => navigate(`/quran/${dailyVerse.surahNumber}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#145C46] text-white hover:bg-[#1E7558] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>قراءة السورة</span>
          </button>
          <button
            onClick={() => playSurah(dailyVerse.surahNumber)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46]/20 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>استماع للسورة</span>
          </button>
          <button
            onClick={handleCopyDaily}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
          >
            {copiedDaily ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedDaily ? 'تم النسخ' : 'نسخ الآية'}</span>
          </button>
          <button
            onClick={handleShareDaily}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
        </div>
      </section>

      {/* 4. Popular Quran Reciters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
              أشهر قراء العالم الإسلامي
            </h2>
            <p className="text-xs sm:text-sm text-[#777F79] dark:text-[#95A39B] font-ui">
              تلاوات صوتية مسجلة بأعلى جودة 
            </p>
          </div>
          <Link
            to="/reciters"
            className="flex items-center gap-1 text-sm font-semibold text-[#145C46] dark:text-[#C5A45D] hover:underline font-ui"
          >
            <span>جميع القراء</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_RECITERS.slice(0, 4).map((reciter) => (
            <div
              key={reciter.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/50 dark:hover:border-[#C5A45D]/50 transition-all shadow-xs group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-bold text-lg flex items-center justify-center shrink-0">
                  {reciter.letter}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#242B28] dark:text-[#F0F5F2] font-ui">
                    {reciter.name}
                  </h3>
                  <p className="text-xs text-[#777F79] dark:text-[#95A39B] mt-0.5 font-ui">
                    {reciter.moshaf[0]?.name || 'حفص عن عاصم'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center justify-between">
                <button
                  onClick={() => playSurah(1, reciter)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs font-medium transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>استماع</span>
                </button>
                <Link
                  to={`/reciters?id=${reciter.id}`}
                  className="text-xs text-[#145C46] dark:text-[#C5A45D] hover:underline font-ui"
                >
                  عرض السور
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recently Played Recitations (if any exist) */}
      {recentTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <h2 className="font-bold text-xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
              تلاوات استمعت إليها مؤخراً
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentTracks.slice(0, 6).map((track, idx) => (
              <div
                key={`${track.surahNumber}-${track.reciterId}-${idx}`}
                onClick={() => playSurah(track.surahNumber)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46] dark:hover:border-[#C5A45D] cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-[#145C46] dark:text-[#C5A45D] font-bold text-sm flex items-center justify-center">
                    {toArabicDigits(track.surahNumber)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#242B28] dark:text-[#F0F5F2] font-ui">
                      سورة {track.surahName}
                    </div>
                    <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
                      {track.reciterName}
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#145C46]/10 text-[#145C46] dark:text-[#C5A45D]">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Quick Access to Holy Surahs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
              سور مباركة من الذكر الحكيم
            </h2>
            <p className="text-xs sm:text-sm text-[#777F79] dark:text-[#95A39B] font-ui">
              وصول سريع لأكثر السور قراءة واستماعاً
            </p>
          </div>
          <Link
            to="/surahs"
            className="flex items-center gap-1 text-sm font-semibold text-[#145C46] dark:text-[#C5A45D] hover:underline font-ui"
          >
            <span>فهرس السور كاملة (114)</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {famousSurahs.map((surah) => (
            <div
              key={surah.number}
              className="p-5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/40 dark:hover:border-[#C5A45D]/40 transition-all shadow-xs group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#145C46] text-[#C5A45D] font-bold text-sm flex items-center justify-center font-ui shadow-xs">
                    {toArabicDigits(surah.number)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2] font-ui">
                      سورة {surah.name}
                    </h3>
                    <span className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
                      {surah.englishName}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5EAE4] dark:bg-[#283731] text-[#145C46] dark:text-[#C5A45D] font-medium font-ui">
                  {getRevelationTypeArabic(surah.revelationType)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#777F79] dark:text-[#95A39B] mt-3 font-ui">
                <span>{toArabicDigits(surah.numberOfAyahs)} آية</span>
                <span>•</span>
                <span>الجزء {toArabicDigits(surah.juz)}</span>
                <span>•</span>
                <span>صفحة {toArabicDigits(surah.startPage)}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/quran/${surah.number}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#145C46] text-white text-xs font-semibold hover:bg-[#1E7558] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة</span>
                </button>
                <button
                  onClick={() => playSurah(surah.number)}
                  title="استماع"
                  className="p-2 rounded-xl bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46] hover:text-white transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
