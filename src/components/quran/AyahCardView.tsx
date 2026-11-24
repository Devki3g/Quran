import React, { useState, useEffect } from 'react';
import { Ayah, SurahDetail } from '../../types/quran';
import { toArabicDigits } from '../../utils/quranUtils';
import { useQuranSettings } from '../../context/QuranSettingsContext';
import { Bookmark, Check, Copy, Share2, BookOpen } from 'lucide-react';
import { TafsirModal } from './TafsirModal';
import { safeCopyToClipboard } from '../../utils/securityUtils';

interface AyahCardViewProps {
  surah: SurahDetail;
  fontSize: number;
  fontFamily: string;
}

export const AyahCardView: React.FC<AyahCardViewProps> = ({ surah, fontSize, fontFamily }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useQuranSettings();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null);

  useEffect(() => {
    setTafsirAyah(null);
  }, [surah.number]);

  const handleCopy = async (ayah: Ayah) => {
    const formatted = `﴿${ayah.text}﴾ [سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]`;
    const ok = await safeCopyToClipboard(formatted);
    if (ok) {
      setCopiedId(ayah.numberInSurah);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (ayah: Ayah) => {
    const shareText = `﴿${ayah.text}﴾ [سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${surah.name} - الآية ${ayah.numberInSurah}`,
          text: shareText,
          url: window.location.href
        });
      } catch {
        // ignore
      }
    } else {
      const ok = await safeCopyToClipboard(shareText);
      if (ok) {
        setCopiedId(ayah.numberInSurah);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    if (isBookmarked(surah.number, ayah.numberInSurah)) {
      removeBookmark(`${surah.number}_${ayah.numberInSurah}`);
    } else {
      addBookmark(surah.number, ayah.numberInSurah, ayah.text);
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'amiri':
        return 'font-amiri';
      case 'cairo':
        return 'font-ui';
      case 'tajawal':
        return 'font-ui';
      case 'amiri-quran':
      default:
        return 'font-quran';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {surah.ayahs.map((ayah) => {
        const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);

        return (
          <div
            key={ayah.numberInSurah}
            id={`ayah-${ayah.numberInSurah}`}
            className={`p-6 rounded-2xl border transition-all ${
              bookmarked
                ? 'bg-[#145C46]/5 dark:bg-[#C5A45D]/10 border-[#145C46]/30 dark:border-[#C5A45D]/30'
                : 'bg-white dark:bg-[#16221E] border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/30'
            }`}
          >
            {/* Top info and action buttons */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#145C46] text-[#C5A45D] font-bold text-xs flex items-center justify-center font-ui shadow-xs">
                  {toArabicDigits(ayah.numberInSurah)}
                </span>
                <span className="text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
                  الجزء {toArabicDigits(ayah.juz)} • صفحة {toArabicDigits(ayah.page)}
                </span>
                {ayah.sajda && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#C5A45D]/20 text-[#145C46] dark:text-[#C5A45D] font-bold font-ui">
                    ۩ سجدة تلاوة
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTafsirAyah(ayah)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#145C46]/10 dark:bg-[#145C46]/30 text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46] hover:text-white dark:hover:bg-[#C5A45D] dark:hover:text-[#145C46] text-xs font-bold font-ui flex items-center gap-1 transition-colors"
                  title="عرض التفسير الميسر"
                  aria-label={`تفسير الآية ${toArabicDigits(ayah.numberInSurah)}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>التفسير</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBookmark(ayah)}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
                    bookmarked
                      ? 'bg-[#C5A45D] text-[#145C46] font-bold'
                      : 'text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={bookmarked ? 'إزالة العلامة' : 'حفظ الآية'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(ayah)}
                  className="p-2 rounded-xl text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="نسخ"
                >
                  {copiedId === ayah.numberInSurah ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(ayah)}
                  className="p-2 rounded-xl text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="مشاركة"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ayah Text (Clickable for Tafsir) */}
            <p
              onClick={() => setTafsirAyah(ayah)}
              title="اضغط لعرض التفسير الميسر"
              className={`cursor-pointer rounded-xl px-2 py-1 -mx-2 hover:bg-[#145C46]/5 dark:hover:bg-[#C5A45D]/10 transition-colors text-right leading-loose text-[#242B28] dark:text-[#F0F5F2] ${getFontFamilyClass()}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {ayah.text}
            </p>
          </div>
        );
      })}

      {/* Ayah Tafsir Modal */}
      <TafsirModal
        surah={surah}
        ayah={tafsirAyah}
        fontFamily={fontFamily}
        onClose={() => setTafsirAyah(null)}
        onSelectAyah={(nextAyah) => setTafsirAyah(nextAyah)}
      />
    </div>
  );
};
