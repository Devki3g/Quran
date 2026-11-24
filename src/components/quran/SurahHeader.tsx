import React from 'react';
import { SurahDetail, SurahMeta } from '../../types/quran';
import { toArabicDigits, getRevelationTypeArabic } from '../../utils/quranUtils';

interface SurahHeaderProps {
  surah: SurahMeta | SurahDetail;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({ surah }) => {
  // Surah 9 (At-Tawbah) does not start with Bismillah
  const showBismillah = surah.number !== 9 && surah.number !== 1;

  return (
    <div className="mb-8">
      {/* Traditional Ornamental Frame Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#16221E] text-[#242B28] dark:text-[#F0F5F2] px-6 py-8 sm:py-10 sm:px-10 shadow-xs border border-[#E2E8E1] dark:border-[#24352D] text-center">
        {/* Subtle geometric pattern & inner hairline gold border */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-40 pointer-events-none" />
        <div className="absolute inset-2.5 sm:inset-3 rounded-2xl border border-[#C5A45D]/25 pointer-events-none" />

        {/* Decorative corner ornaments */}
        <div className="absolute top-3.5 right-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none" aria-hidden="true">✦</div>
        <div className="absolute top-3.5 left-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none" aria-hidden="true">✦</div>
        <div className="absolute bottom-3.5 right-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none" aria-hidden="true">✦</div>
        <div className="absolute bottom-3.5 left-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none" aria-hidden="true">✦</div>

        <div className="relative z-10 space-y-3">
          {/* Surah Number & Revelation */}
          <div className="inline-flex items-center justify-center gap-2 text-[#145C46] dark:text-[#C5A45D] text-xs sm:text-sm font-semibold font-ui">
            <span>سورة رقم {toArabicDigits(surah.number)}</span>
            <span aria-hidden="true">·</span>
            <span>{getRevelationTypeArabic(surah.revelationType)}</span>
          </div>

          {/* Surah Name in Arabic */}
          <h1 className="font-quran text-3xl sm:text-4xl lg:text-5xl font-bold text-[#145C46] dark:text-[#F0F5F2] tracking-wide">
            سُورَةُ {surah.name}
          </h1>

          {/* Verses & Juz info */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-[#777F79] dark:text-[#95A39B] font-ui">
            <span>عدد آياتها: {toArabicDigits(surah.numberOfAyahs)} آية</span>
            <span aria-hidden="true">·</span>
            <span>الجزء {toArabicDigits(surah.juz)}</span>
            <span aria-hidden="true">·</span>
            <span>صفحة {toArabicDigits(surah.startPage)}</span>
          </div>
        </div>
      </div>

      {/* Traditional Bismillah Calligraphy (except At-Tawbah and Al-Fatihah where it's ayah 1) */}
      {showBismillah && (
        <div className="my-8 text-center">
          <div className="inline-block relative">
            <span className="font-quran text-2xl sm:text-3xl text-[#145C46] dark:text-[#C5A45D] leading-relaxed">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
            <div className="h-0.5 w-24 mx-auto bg-linear-to-r from-transparent via-[#C5A45D] to-transparent mt-2 opacity-60" />
          </div>
        </div>
      )}
    </div>
  );
};
