import React, { useState, useEffect } from 'react';
import { Ayah, SurahDetail } from '../../types/quran';
import { toArabicDigits } from '../../utils/quranUtils';
import { useQuranSettings } from '../../context/QuranSettingsContext';
import { Bookmark, Check, Copy, Share2, BookOpen } from 'lucide-react';
import { TafsirModal } from './TafsirModal';
import { safeCopyToClipboard } from '../../utils/securityUtils';
import { RubElHizbIcon } from '../icons/IslamicIcons';

interface MushafViewProps {
  surah: SurahDetail;
  fontSize: number;
  fontFamily: string;
}

export const MushafView: React.FC<MushafViewProps> = ({ surah, fontSize, fontFamily }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useQuranSettings();
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedAyah(null);
    setTafsirAyah(null);
  }, [surah.number]);

  const handleSelectAyah = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setTafsirAyah(ayah);
  };

  const handleCopy = async (ayah: Ayah, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `﴿${ayah.text}﴾ [سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]`;
    const ok = await safeCopyToClipboard(formatted);
    if (ok) {
      setCopiedId(ayah.numberInSurah);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (ayah: Ayah, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `﴿${ayah.text}﴾ [سورة ${surah.name}: الآية ${toArabicDigits(ayah.numberInSurah)}]`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${surah.name} - الآية ${ayah.numberInSurah}`,
          text: shareText,
          url: window.location.href
        });
      } catch {
        // user cancelled or failed
      }
    } else {
      const ok = await safeCopyToClipboard(shareText);
      if (ok) {
        setCopiedId(ayah.numberInSurah);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  };

  const handleToggleBookmark = (ayah: Ayah, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked(surah.number, ayah.numberInSurah)) {
      const bId = `${surah.number}_${ayah.numberInSurah}`;
      removeBookmark(bId);
    } else {
      addBookmark(surah.number, ayah.numberInSurah, ayah.text);
    }
  };

  // Font family mapping
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'amiri':
        return 'font-amiri';
      case 'cairo':
        return 'font-ui font-medium';
      case 'tajawal':
        return 'font-ui';
      case 'amiri-quran':
      default:
        return 'font-quran';
    }
  };

  return (
    <div className="relative">
      {/* Traditional Mushaf Bordered Container */}
      <div className="relative mx-auto max-w-4xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xs transition-all">
        {/* Subtle decorative inner border */}
        <div className="absolute inset-2.5 sm:inset-3 border border-[#C5A45D]/25 rounded-xl pointer-events-none" />

        {/* Page / Juz indicator */}
        <div className="flex items-center justify-between text-xs text-[#777F79] dark:text-[#95A39B] font-ui mb-3 pb-3 border-b border-[#E5EAE4]/60 dark:border-[#24352D]/60 select-none">
          <span className="flex items-center gap-1.5 text-[#145C46] dark:text-[#C5A45D] font-bold">
            <RubElHizbIcon className="w-3.5 h-3.5" />
            <span>الجزء {toArabicDigits(surah.juz)}</span>
          </span>
          <span className="font-bold text-sm text-[#242B28] dark:text-[#F0F5F2]">
            سورة {surah.name}
          </span>
          <span>صفحة {toArabicDigits(surah.startPage)}</span>
        </div>

        <p className="text-center text-[11px] sm:text-xs text-[#777F79] dark:text-[#95A39B] font-ui mb-5 select-none">
          اضغط على أي آية لعرض التفسير الميسر أو حفظها
        </p>

        {/* Selected Ayah Action Bar (Sticky floating bar when an ayah is clicked) */}
        {selectedAyah && (
          <div className="sticky top-20 z-30 mb-6 p-3 rounded-2xl bg-[#145C46] text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#C5A45D] text-[#145C46] font-bold text-xs flex items-center justify-center">
                {toArabicDigits(selectedAyah.numberInSurah)}
              </span>
              <span className="text-xs font-medium font-ui">
                آية رقم {toArabicDigits(selectedAyah.numberInSurah)} من سورة {surah.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Open Tafsir button */}
              <button
                type="button"
                onClick={() => setTafsirAyah(selectedAyah)}
                className="px-2.5 py-2 rounded-xl bg-[#C5A45D] hover:bg-[#d3b36d] text-[#145C46] font-bold text-xs flex items-center gap-1 transition-colors"
                title="عرض التفسير الميسر"
              >
                <BookOpen className="w-4 h-4" />
                <span>التفسير</span>
              </button>

              {/* Bookmark button */}
              <button
                type="button"
                onClick={(e) => handleToggleBookmark(selectedAyah, e)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
                  isBookmarked(surah.number, selectedAyah.numberInSurah)
                    ? 'bg-[#C5A45D] text-[#145C46] font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="حفظ العلامة"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isBookmarked(surah.number, selectedAyah.numberInSurah) ? 'محفوظة' : 'حفظ'}
                </span>
              </button>

              {/* Copy */}
              <button
                onClick={(e) => handleCopy(selectedAyah, e)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
                title="نسخ الآية"
              >
                {copiedId === selectedAyah.numberInSurah ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="hidden sm:inline text-emerald-200">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">نسخ</span>
                  </>
                )}
              </button>

              {/* Share */}
              <button
                onClick={(e) => handleShare(selectedAyah, e)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>

              {/* Close */}
              <button
                onClick={() => setSelectedAyah(null)}
                className="px-2 py-1 text-xs text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Continuous Mushaf Paragraph Reading Flow */}
        <div
          dir="rtl"
          className={`text-center leading-[2.5] tracking-wide transition-all ${getFontFamilyClass()}`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${fontSize * 2.3}px`
          }}
        >
          {surah.ayahs.map((ayah) => {
            const isSelected = selectedAyah?.numberInSurah === ayah.numberInSurah;
            const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);

            return (
              <span
                key={ayah.numberInSurah}
                id={`ayah-${ayah.numberInSurah}`}
                role="button"
                tabIndex={0}
                aria-label={`الآية ${toArabicDigits(ayah.numberInSurah)} - اضغط لعرض التفسير الميسر`}
                onClick={() => handleSelectAyah(ayah)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectAyah(ayah);
                  }
                }}
                className={`group cursor-pointer rounded-lg px-1 transition-colors relative inline ${
                  isSelected
                    ? 'bg-[#C5A45D]/25 dark:bg-[#C5A45D]/30 text-[#145C46] dark:text-[#EAD69E]'
                    : bookmarked
                    ? 'bg-[#145C46]/10 dark:bg-[#C5A45D]/15'
                    : 'hover:bg-[#145C46]/5 dark:hover:bg-[#C5A45D]/10'
                }`}
              >
                {/* Ayah Text */}
                <span className="text-[#242B28] dark:text-[#F0F5F2]">{ayah.text}</span>

                {/* Decorative Ayah End Marker */}
                <span
                  className="inline-flex items-center justify-center mx-1.5 text-[#C5A45D] font-amiri font-bold select-none text-[0.85em] align-middle hover:scale-110 transition-transform"
                  title={`آية ${ayah.numberInSurah}`}
                >
                  <span className="relative inline-flex items-center justify-center">
                    <span className="opacity-90">﴿{toArabicDigits(ayah.numberInSurah)}﴾</span>
                    {bookmarked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#145C46] dark:bg-[#C5A45D]" />
                    )}
                  </span>
                </span>

                {/* Sajdah marker when present */}
                {ayah.sajda && (
                  <span
                    className="inline-block mx-1 px-1.5 py-0.5 rounded text-[11px] bg-[#C5A45D]/20 text-[#145C46] dark:text-[#C5A45D] font-ui align-middle font-bold"
                    title="سجدة تلاوة"
                  >
                    ۩ سجدة
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Mushaf Page Bottom Decorative Frame */}
        <div className="mt-10 pt-4 border-t border-[#E5EAE4]/60 dark:border-[#24352D]/60 flex items-center justify-center text-xs text-[#777F79] dark:text-[#95A39B] font-ui">
          <span>نهاية سورة {surah.name} ({toArabicDigits(surah.numberOfAyahs)} آية)</span>
        </div>
      </div>

      {/* Ayah Tafsir Modal */}
      <TafsirModal
        surah={surah}
        ayah={tafsirAyah}
        fontFamily={fontFamily}
        onClose={() => setTafsirAyah(null)}
        onSelectAyah={(nextAyah) => {
          setSelectedAyah(nextAyah);
          setTafsirAyah(nextAyah);
        }}
      />
    </div>
  );
};
