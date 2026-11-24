import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Play,
  Pause,
  Loader2,
  Radio,
  ListMusic,
  X,
  Download
} from 'lucide-react';
import { fetchReciters, filterReciters } from '../services/mp3quranApi';
import { Moshaf, Reciter } from '../types/quran';
import { useQuranAudio } from '../context/AudioContext';
import { SURAHS_LIST } from '../constants/surahsData';
import { toArabicDigits, downloadSurahAudio, getAudioUrl } from '../utils/quranUtils';
import { parsePositiveIntId } from '../utils/securityUtils';
import { PageHeader } from '../components/common/PageHeader';

export const RecitersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialReciterId = searchParams.get('id');

  const {
    activeReciter,
    activeMoshaf,
    setActiveReciter,
    setActiveMoshaf,
    playSurah,
    currentTrack,
    isPlaying
  } = useQuranAudio();

  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');
  const [selectedRiwayah, setSelectedRiwayah] = useState<string>('الكل');

  // Selected Reciter Modal/Drawer for viewing available Surahs
  const [viewingReciter, setViewingReciter] = useState<Reciter | null>(null);
  const [selectedMoshafIndex, setSelectedMoshafIndex] = useState(0);
  const [downloadingSurahId, setDownloadingSurahId] = useState<number | null>(null);

  const handleDownloadReciterSurah = async (surahNumber: number, surahName: string, moshaf: Moshaf, reciter: Reciter) => {
    const url = getAudioUrl(moshaf.server, surahNumber);
    setDownloadingSurahId(surahNumber);
    await downloadSurahAudio(url, surahName, reciter.name);
    setTimeout(() => setDownloadingSurahId(null), 2000);
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetchReciters('ar')
      .then((data) => {
        if (mounted) {
          setReciters(data);
          setIsLoading(false);

          const validReciterId = parsePositiveIntId(initialReciterId, 1, 999999);
          if (validReciterId) {
            const found = data.find((r) => r.id === validReciterId);
            if (found) {
              setViewingReciter(found);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Reciters fetch failed', err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialReciterId]);

  useEffect(() => {
    if (!viewingReciter) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingReciter(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewingReciter]);

  // Extract available letters for filter
  const letters = useMemo(() => {
    const set = new Set<string>();
    reciters.forEach((r) => {
      if (r.letter) set.add(r.letter);
    });
    return ['الكل', ...Array.from(set).sort()];
  }, [reciters]);

  // Extract common riwayahs
  const riwayahs = [
    'الكل',
    'حفص عن عاصم',
    'ورش عن نافع',
    'قالون عن نافع',
    'الدوري عن أبي عمرو',
    'شعبة عن عاصم',
    'مجود'
  ];

  const filtered = useMemo(() => {
    return filterReciters(reciters, searchQuery, selectedRiwayah, selectedLetter);
  }, [reciters, searchQuery, selectedRiwayah, selectedLetter]);

  const handlePlayReciterSurah = (surahNumber: number, reciter: Reciter, moshaf: Moshaf) => {
    setActiveReciter(reciter);
    setActiveMoshaf(moshaf);
    playSurah(surahNumber, reciter, moshaf);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <PageHeader
        compact
        icon
        kicker="تلاوات مع كبار القراء "
        title="قُرَّاءُ الْقُرْآنِ الْكَرِيمِ"
        subtitle="استمع لتلاوات خاشعة بأصوات خيرة أئمة وقراء العالم الإسلامي بمختلف الروايات والمصاحف"
      />

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#777F79] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم القارئ (مثل: ماهر المعيقلي، عبد الباسط، الحصري)..."
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

          {/* Riwayah Filter Dropdown */}
          <select
            value={selectedRiwayah}
            onChange={(e) => setSelectedRiwayah(e.target.value)}
            aria-label="تصفية حسب الرواية"
            className="bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] text-sm rounded-xl px-4 py-2.5 font-ui focus:outline-none"
          >
            {riwayahs.map((r) => (
              <option key={r} value={r}>
                {r === 'الكل' ? 'جميع الروايات' : `رواية: ${r}`}
              </option>
            ))}
          </select>
        </div>

        {/* Alphabetical Letters Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-ui">
          <span className="text-[#777F79] dark:text-[#95A39B] shrink-0 me-1">الحرف:</span>
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedLetter === letter
                  ? 'bg-[#145C46] text-white font-bold'
                  : 'bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#242B28] dark:text-gray-300 hover:bg-[#145C46]/10'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#145C46] dark:text-[#C5A45D] mx-auto" />
          <p className="text-sm font-bold text-[#145C46] dark:text-[#C5A45D] font-ui">
            جارٍ تحميل قائمة القراء من شبكة MP3Quran...
          </p>
        </div>
      )}

      {/* Reciters Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((reciter) => {
            const isCurrentlySelected = activeReciter?.id === reciter.id;
            const primaryMoshaf = reciter.moshaf[0];

            return (
              <div
                key={reciter.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#16221E] border transition-all shadow-xs flex flex-col justify-between ${
                  isCurrentlySelected
                    ? 'border-[#145C46] dark:border-[#C5A45D] ring-2 ring-[#145C46]/20'
                    : 'border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/40'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-bold text-xl flex items-center justify-center shrink-0">
                      {reciter.letter || 'ق'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2] font-ui truncate">
                        {reciter.name}
                      </h3>
                      <div className="text-xs text-[#777F79] dark:text-[#95A39B] mt-0.5 font-ui">
                        {reciter.moshaf.length > 1
                          ? `${toArabicDigits(reciter.moshaf.length)} مصاحف / روايات مسجلة`
                          : primaryMoshaf?.name || 'حفص عن عاصم'}
                      </div>
                    </div>
                  </div>

                  {/* Recitation Badges */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {reciter.moshaf.map((m) => (
                      <span
                        key={m.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#777F79] dark:text-[#95A39B] border border-[#E2E8E1] dark:border-[#24352D]"
                      >
                        {m.name} ({toArabicDigits(m.surah_total)} سورة)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center gap-2 font-ui">
                  <button
                    onClick={() => {
                      if (primaryMoshaf) {
                        handlePlayReciterSurah(1, reciter, primaryMoshaf);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>تشغيل الفاتحة</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewingReciter(reciter);
                      setSelectedMoshafIndex(0);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] text-xs font-semibold text-[#242B28] dark:text-[#F0F5F2] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ListMusic className="w-3.5 h-3.5 text-[#145C46] dark:text-[#C5A45D]" />
                    <span>عرض السور</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reciter Surahs Modal / Drawer */}
      {viewingReciter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setViewingReciter(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`سور القارئ ${viewingReciter.name}`}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#121B18] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#145C46] text-[#C5A45D] font-bold text-lg flex items-center justify-center font-ui shadow-xs">
                  {viewingReciter.letter || 'ق'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2] font-ui">
                    القارئ {viewingReciter.name}
                  </h3>
                  <p className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
                    اختر السورة للاستماع المباشر بصوت القارئ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReciter(null)}
                className="p-1.5 rounded-xl text-[#777F79] hover:text-[#242B28] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Moshaf / Style Switcher if multiple */}
            {viewingReciter.moshaf.length > 1 && (
              <div className="px-5 py-2.5 bg-gray-50 dark:bg-[#1E2D27]/50 border-b border-[#E2E8E1] dark:border-[#24352D] flex items-center gap-2 overflow-x-auto text-xs font-ui">
                <span className="text-[#777F79] dark:text-[#95A39B] shrink-0">المصحف / الرواية:</span>
                {viewingReciter.moshaf.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMoshafIndex(idx)}
                    className={`px-3 py-1 rounded-lg shrink-0 transition-colors ${
                      selectedMoshafIndex === idx
                        ? 'bg-[#145C46] text-white font-bold'
                        : 'bg-white dark:bg-[#16221E] text-[#242B28] dark:text-gray-300 border border-[#E2E8E1] dark:border-[#24352D]'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}

            {/* Surahs List */}
            <div className="overflow-y-auto p-4 divide-y divide-[#E2E8E1]/40 dark:divide-[#24352D]/40">
              {(() => {
                const currentMoshaf = viewingReciter.moshaf[selectedMoshafIndex] || viewingReciter.moshaf[0];
                const availableSurahList = currentMoshaf.surah_list
                  ? currentMoshaf.surah_list.split(',').map((n) => parseInt(n.trim(), 10))
                  : SURAHS_LIST.map((s) => s.number);

                return SURAHS_LIST.map((surah) => {
                  const isAvailable = availableSurahList.includes(surah.number);
                  const isCurrentlyPlayingThis =
                    currentTrack?.surahNumber === surah.number &&
                    currentTrack?.reciterId === viewingReciter.id &&
                    isPlaying;

                  return (
                    <div
                      key={surah.number}
                      className={`py-3 flex items-center justify-between transition-colors ${
                        !isAvailable ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center font-bold text-[#145C46] dark:text-[#C5A45D] font-ui">
                          {toArabicDigits(surah.number)}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-[#242B28] dark:text-[#F0F5F2] font-ui">
                            سورة {surah.name}
                          </div>
                          <div className="text-[11px] text-[#777F79] dark:text-[#95A39B] font-ui">
                            {toArabicDigits(surah.numberOfAyahs)} آية
                          </div>
                        </div>
                      </div>

                      {isAvailable ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayReciterSurah(surah.number, viewingReciter, currentMoshaf)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isCurrentlyPlayingThis
                                ? 'bg-[#145C46] text-white shadow-xs'
                                : 'bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46] hover:text-white'
                            }`}
                          >
                            {isCurrentlyPlayingThis ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>جارٍ الاستماع</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>استماع</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDownloadReciterSurah(surah.number, surah.name, currentMoshaf, viewingReciter)}
                            disabled={downloadingSurahId === surah.number}
                            title={`تحميل سورة ${surah.name} بصوت ${viewingReciter.name}`}
                            className="p-1.5 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] text-[#777F79] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {downloadingSurahId === surah.number ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#145C46]" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
                          غير متوفرة
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
