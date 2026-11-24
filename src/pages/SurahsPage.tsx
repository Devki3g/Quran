import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Volume2,
  ArrowUpDown,
  Layers,
  Download,
  Loader2,
  X
} from 'lucide-react';
import { SURAHS_LIST } from '../constants/surahsData';
import { searchSurahs, toArabicDigits, getRevelationTypeArabic, downloadSurahAudio, getAudioUrl } from '../utils/quranUtils';
import { useQuranAudio } from '../context/AudioContext';
import { PageHeader } from '../components/common/PageHeader';

export const SurahsPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSurah, currentTrack, isPlaying, activeReciter, activeMoshaf } = useQuranAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [sortBy, setSortBy] = useState<'number' | 'ayahs'>('number');
  const [downloadingNumber, setDownloadingNumber] = useState<number | null>(null);

  const handleDownloadSurah = async (surahNum: number, surahName: string) => {
    const server = activeMoshaf?.server || 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/';
    const url = getAudioUrl(server, surahNum);
    const reciterName = activeReciter?.name || 'ماهر المعيقلي';
    setDownloadingNumber(surahNum);
    await downloadSurahAudio(url, surahName, reciterName);
    setTimeout(() => setDownloadingNumber(null), 2000);
  };

  const filteredSurahs = useMemo(() => {
    let list = searchSurahs(searchQuery, SURAHS_LIST);

    if (filterType !== 'all') {
      list = list.filter((s) => s.revelationType === filterType);
    }

    if (sortBy === 'ayahs') {
      list = [...list].sort((a, b) => b.numberOfAyahs - a.numberOfAyahs);
    } else {
      list = [...list].sort((a, b) => a.number - b.number);
    }

    return list;
  }, [searchQuery, filterType, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <PageHeader
        compact
        icon
        kicker="فهرس السور الكامل"
        title="سُوَرُ الْقُرْآنِ الْكَرِيمِ"
        subtitle="مائة وأربع عشرة سورة كريمة، مرتبة وفق المصحف العثماني الشريف"
      />

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-[#777F79] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم السورة، رقمها، أو معناها..."
            className="w-full bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] rounded-xl pr-11 pl-10 py-2.5 text-sm text-[#242B28] dark:text-[#F0F5F2] placeholder-[#777F79] focus:outline-none focus:ring-2 focus:ring-[#145C46]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips & Sort */}
        <div className="flex flex-wrap items-center gap-2 font-ui">
          <div className="flex items-center bg-[#FAFAF6] dark:bg-[#1E2D27] p-1 rounded-xl border border-[#E2E8E1] dark:border-[#24352D]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-[#145C46] text-white font-bold shadow-xs'
                  : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
              }`}
            >
              الكل (114)
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'Meccan'
                  ? 'bg-[#145C46] text-white font-bold shadow-xs'
                  : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
              }`}
            >
              مكية (86)
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'Medinan'
                  ? 'bg-[#145C46] text-white font-bold shadow-xs'
                  : 'text-[#777F79] hover:text-[#242B28] dark:hover:text-white'
              }`}
            >
              مدنية (28)
            </button>
          </div>

          {/* Sort Dropdown */}
          <button
            onClick={() => setSortBy(sortBy === 'number' ? 'ayahs' : 'number')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-xs font-medium text-[#777F79] dark:text-[#95A39B] hover:text-[#145C46] dark:hover:text-[#C5A45D] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortBy === 'number' ? 'ترتيب المصحف' : 'الأطول آيات'}</span>
          </button>
        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => {
          const isCurrentlyPlaying = currentTrack?.surahNumber === surah.number && isPlaying;

          return (
            <div
              key={surah.number}
              className={`p-5 rounded-2xl bg-white dark:bg-[#16221E] border transition-all shadow-xs group flex flex-col justify-between ${
                isCurrentlyPlaying
                  ? 'border-[#145C46] dark:border-[#C5A45D] ring-2 ring-[#145C46]/20'
                  : 'border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/40 dark:hover:border-[#C5A45D]/40'
              }`}
            >
              {/* Header: Number, Name, Revelation badge */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#145C46] text-[#C5A45D] font-bold text-base flex items-center justify-center font-ui shadow-xs shrink-0">
                      {toArabicDigits(surah.number)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-[#242B28] dark:text-[#F0F5F2] font-ui leading-tight">
                        سورة {surah.name}
                      </h3>
                      <div className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui mt-0.5">
                        {surah.englishName} ({surah.englishNameTranslation})
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium font-ui ${
                      surah.revelationType === 'Meccan'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#145C46] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                    }`}
                  >
                    {getRevelationTypeArabic(surah.revelationType)}
                  </span>
                </div>

                {/* Ayat, Juz, Page Info */}
                <div className="flex items-center gap-2 text-xs text-[#777F79] dark:text-[#95A39B] mt-4 font-ui">
                  <span className="font-semibold text-[#145C46] dark:text-[#C5A45D]">
                    {toArabicDigits(surah.numberOfAyahs)} آية
                  </span>
                  <span>•</span>
                  <span>الجزء {toArabicDigits(surah.juz)}</span>
                  <span>•</span>
                  <span>صفحة {toArabicDigits(surah.startPage)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center gap-2 font-ui">
                <button
                  onClick={() => navigate(`/quran/${surah.number}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>قراءة في المصحف</span>
                </button>

                <button
                  onClick={() => playSurah(surah.number)}
                  title="استماع للسورة"
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isCurrentlyPlaying
                      ? 'bg-[#145C46] text-white border-[#145C46]'
                      : 'border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46] hover:text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownloadSurah(surah.number, surah.name)}
                  disabled={downloadingNumber === surah.number}
                  title={`تحميل سورة ${surah.name} بصيغة MP3`}
                  className="p-2.5 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-[#145C46]/10 transition-colors"
                >
                  {downloadingNumber === surah.number ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#145C46]" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="py-16 text-center text-[#777F79] dark:text-[#95A39B]">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#145C46] dark:text-[#C5A45D]" />
          <p className="text-base font-bold font-ui">لم يتم العثور على أي سورة مطابقة للبحث</p>
          <p className="text-xs font-ui mt-1">يرجى تجربة كلمات بحث أخرى أو مسح الفلتر</p>
        </div>
      )}
    </div>
  );
};
