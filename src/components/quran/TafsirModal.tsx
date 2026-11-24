import React, { useEffect, useState, useCallback } from 'react';
import {
  BookOpen,
  X,
  Loader2,
  AlertCircle,
  Bookmark,
  Copy,
  Check,
  Share2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { Ayah, SurahDetail } from '../../types/quran';
import { fetchAyahTafsir } from '../../services/tafsirService';
import { toArabicDigits } from '../../utils/quranUtils';
import { useQuranSettings } from '../../context/QuranSettingsContext';
import { safeCopyToClipboard } from '../../utils/securityUtils';

interface TafsirModalProps {
  surah: SurahDetail;
  ayah: Ayah | null;
  fontFamily: string;
  onClose: () => void;
  onSelectAyah: (ayah: Ayah) => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surah,
  ayah,
  fontFamily,
  onClose,
  onSelectAyah,
}) => {
  const { addBookmark, removeBookmark, isBookmarked } = useQuranSettings();
  const [tafsirText, setTafsirText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTafsir, setCopiedTafsir] = useState<boolean>(false);

  const loadTafsir = useCallback(async (surahNum: number, ayahNum: number) => {
    setIsLoading(true);
    setError(null);
    setTafsirText('');
    try {
      const text = await fetchAyahTafsir(surahNum, ayahNum);
      setTafsirText(text);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'تعذر تحميل التفسير الميسر لهذه الآية.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ayah) return;
    let active = true;

    setIsLoading(true);
    setError(null);
    setTafsirText('');

    fetchAyahTafsir(surah.number, ayah.numberInSurah)
      .then((text) => {
        if (active) {
          setTafsirText(text);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'تعذر تحميل التفسير الميسر لهذه الآية.'
          );
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [surah.number, ayah?.numberInSurah]);

  useEffect(() => {
    if (!ayah) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ayah, onClose]);

  if (!ayah) return null;

  const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);
  const currentIndex = surah.ayahs.findIndex((a) => a.numberInSurah === ayah.numberInSurah);
  const prevAyah = currentIndex > 0 ? surah.ayahs[currentIndex - 1] : null;
  const nextAyah =
    currentIndex >= 0 && currentIndex < surah.ayahs.length - 1
      ? surah.ayahs[currentIndex + 1]
      : null;

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'amiri':
        return 'font-amiri';
      case 'cairo':
      case 'tajawal':
        return 'font-ui';
      case 'amiri-quran':
      default:
        return 'font-quran';
    }
  };

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(`${surah.number}_${ayah.numberInSurah}`);
    } else {
      addBookmark(surah.number, ayah.numberInSurah, ayah.text);
    }
  };

  const handleCopyTafsir = async () => {
    const content = tafsirText
      ? `﴿${ayah.text}﴾\n[سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]\n\nالتفسير الميسر:\n${tafsirText}`
      : `﴿${ayah.text}﴾ [سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]`;
    const ok = await safeCopyToClipboard(content);
    if (ok) {
      setCopiedTafsir(true);
      setTimeout(() => setCopiedTafsir(false), 2000);
    }
  };

  const handleShare = async () => {
    const content = tafsirText
      ? `﴿${ayah.text}﴾ [سورة ${surah.name}: ${toArabicDigits(ayah.numberInSurah)}]\n\nالتفسير الميسر: ${tafsirText}`
      : `﴿${ayah.text}﴾ [سورة ${surah.name}: ${toArabicDigits(ayah.numberInSurah)}]`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `تفسير الآية ${ayah.numberInSurah} من سورة ${surah.name}`,
          text: content,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyTafsir();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-modal-title"
      dir="rtl"
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-[#FAFAF6] dark:bg-[#121C18] border border-[#E2E8E1] dark:border-[#24352D] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-[#16221E] border-b border-[#E2E8E1] dark:border-[#24352D]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#145C46] text-[#C5A45D] flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="tafsir-modal-title"
                className="font-ui font-bold text-base sm:text-lg text-[#242B28] dark:text-[#F0F5F2] truncate"
              >
                سورة {surah.name} • الآية {toArabicDigits(ayah.numberInSurah)}
              </h2>
              <p className="font-ui text-xs text-[#777F79] dark:text-[#95A39B]">
                الجزء {toArabicDigits(ayah.juz)} • صفحة {toArabicDigits(ayah.page)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التفسير"
            className="w-9 h-9 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#777F79] hover:text-[#242B28] dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body: Ayah Text + Muyassar Tafsir */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quranic Ayah Block */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#C5A45D]/35 dark:border-[#C5A45D]/25 shadow-xs">
            <p
              className={`text-right text-xl sm:text-2xl leading-[2.1] text-[#242B28] dark:text-[#F0F5F2] ${getFontFamilyClass()}`}
            >
              {ayah.text}{' '}
              <span className="text-[#C5A45D] font-amiri font-bold text-lg sm:text-xl mx-1">
                ﴿{toArabicDigits(ayah.numberInSurah)}﴾
              </span>
            </p>
          </div>

          {/* Tafsir Header & Content */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8E1]/70 dark:border-[#24352D]/70">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#145C46]/10 dark:bg-[#145C46]/30 text-[#145C46] dark:text-[#C5A45D] font-ui font-bold text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5" />
                <span>التفسير الميسر</span>
              </span>
              <span className="font-ui text-[11px] text-[#777F79] dark:text-[#95A39B]">
                مجمع الملك فهد لطباعة المصحف الشريف
              </span>
            </div>

            {isLoading && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-7 h-7 animate-spin text-[#145C46] dark:text-[#C5A45D]" />
                <p className="font-ui text-sm text-[#777F79] dark:text-[#95A39B]">
                  جارٍ تحميل التفسير الميسر...
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div className="py-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="font-ui text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => loadTafsir(surah.number, ayah.numberInSurah)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white font-ui text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}

            {!isLoading && !error && tafsirText && (
              <p className="font-ui text-base sm:text-[17px] leading-[1.95] text-[#242B28] dark:text-[#EAF1ED] whitespace-pre-line">
                {tafsirText}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Actions + Prev/Next Ayah Navigation */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#16221E] border-t border-[#E2E8E1] dark:border-[#24352D] flex flex-wrap items-center justify-between gap-3 font-ui">
          {/* Ayah & Tafsir Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                bookmarked
                  ? 'bg-[#C5A45D] text-[#145C46]'
                  : 'bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:border-[#145C46]'
              }`}
              title={bookmarked ? 'إزالة العلامة' : 'حفظ الآية'}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{bookmarked ? 'محفوظة' : 'حفظ'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTafsir}
              className="px-3 py-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:border-[#145C46] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="نسخ الآية والتفسير"
            >
              {copiedTafsir ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ التفسير</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:border-[#145C46] transition-colors"
              title="مشاركة"
              aria-label="مشاركة الآية والتفسير"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prev / Next Ayah Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prevAyah}
              onClick={() => prevAyah && onSelectAyah(prevAyah)}
              className="px-3 py-2 rounded-xl bg-[#FAFAF6] dark:bg-[#1E2D27] border border-[#E2E8E1] dark:border-[#24352D] text-xs font-semibold text-[#242B28] dark:text-[#F0F5F2] hover:border-[#145C46] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الآية السابقة</span>
            </button>

            <button
              type="button"
              disabled={!nextAyah}
              onClick={() => nextAyah && onSelectAyah(nextAyah)}
              className="px-3 py-2 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
            >
              <span>الآية التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
