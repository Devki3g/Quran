import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { POPULAR_RECITERS } from '../../constants/popularReciters';
import { useQuranAudio } from '../../context/AudioContext';

export const Footer: React.FC = () => {
  const { playSurah, setActiveReciter } = useQuranAudio();

  const quickSurahs = [
    { number: 1, name: 'الفاتحة' },
    { number: 2, name: 'البقرة' },
    { number: 18, name: 'الكهف' },
    { number: 36, name: 'يس' },
    { number: 55, name: 'الرحمن' },
    { number: 56, name: 'الواقعة' },
    { number: 67, name: 'الملك' },
    { number: 112, name: 'الإخلاص' }
  ];

  return (
    <footer className="mt-16 bg-[#145C46] dark:bg-[#0E1613] text-[#FAFAF6] border-t border-[#1E7558] dark:border-[#24352D] pt-12 pb-28 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#C5A45D] font-ui">القرآن الكريم</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-ui">
              مصحف إلكتروني شامل لتلاوة القرآن الكريم بنمط المصحف الشريف المتصل، مع استماع مباشر لكبار القراء عبر خوادم شبكة MP3Quran العالمية وحفظ مواضع القراءة.
            </p>
          </div>

          {/* Col 2: Quick Surahs */}
          <div>
            <h4 className="font-bold text-sm text-[#C5A45D] mb-3 font-ui">سور مباركة</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-emerald-100/80 font-ui">
              {quickSurahs.map((surah) => (
                <li key={surah.number}>
                  <Link
                    to={`/quran/${surah.number}`}
                    className="hover:text-white hover:underline flex items-center gap-1"
                  >
                    <span>•</span>
                    <span>سورة {surah.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Popular Reciters */}
          <div>
            <h4 className="font-bold text-sm text-[#C5A45D] mb-3 font-ui">كبار القراء</h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-ui">
              {POPULAR_RECITERS.slice(0, 5).map((reciter) => (
                <li key={reciter.id}>
                  <button
                    onClick={() => {
                      setActiveReciter(reciter);
                      playSurah(1, reciter);
                    }}
                    className="hover:text-[#C5A45D] flex items-center gap-1.5 transition-colors text-right"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C5A45D] shrink-0" />
                    <span>{reciter.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quranic Verse Quote */}
          <div className="p-4 rounded-2xl bg-black/15 border border-emerald-700/40 dark:border-emerald-900/40 text-center flex flex-col justify-center">
            <span className="text-xs text-[#C5A45D] font-bold mb-2">تذكرة قرآنية</span>
            <p className="font-quran text-base sm:text-lg text-emerald-50 leading-loose">
              ﴿إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ وَيُبَشِّرُ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا﴾
            </p>
            <span className="text-[11px] text-emerald-200/70 mt-1 font-ui">[سورة الإسراء: الآية ٩]</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/60 dark:border-emerald-950 pt-6 text-center text-xs text-emerald-200/60 font-ui flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            القرآن الكريم — وقف لله تعالى، نسأل الله أن يتقبل منا ومنكم صالح الأعمال.
          </p>
        </div>
      </div>
    </footer>
  );
};
