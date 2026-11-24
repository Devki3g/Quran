import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Volume2, ArrowLeft } from 'lucide-react';
import { SURAHS_LIST } from '../../constants/surahsData';
import { searchSurahs, toArabicDigits, getRevelationTypeArabic } from '../../utils/quranUtils';
import { useQuranAudio } from '../../context/AudioContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { playSurah } = useQuranAudio();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchSurahs(query, SURAHS_LIST).slice(0, 10);

  const handleRead = (surahNumber: number) => {
    onClose();
    navigate(`/quran/${surahNumber}`);
  };

  const handlePlay = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSurah(surahNumber);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="بحث في القرآن الكريم"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#121B18]">
          <Search className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن سورة بالاسم، الرقم، أو المعنى (مثلاً: الكهف، 18، Al-Kahf)..."
            className="w-full bg-transparent text-[#242B28] dark:text-[#F0F5F2] placeholder-[#777F79] dark:placeholder-[#95A39B] text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#777F79] hover:text-[#242B28] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#E2E8E1] dark:bg-[#24352D] text-[#242B28] dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            إغلاق
          </button>
        </div>

        {/* Results list */}
        <div className="overflow-y-auto p-2 divide-y divide-[#E2E8E1]/50 dark:divide-[#24352D]/50">
          {results.length === 0 ? (
            <div className="py-12 text-center text-[#777F79] dark:text-[#95A39B]">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#145C46] dark:text-[#C5A45D]" />
              <p className="text-sm">لم يتم العثور على سورة تطابق "{query}"</p>
            </div>
          ) : (
            results.map((surah) => (
              <div
                key={surah.number}
                onClick={() => handleRead(surah.number)}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-bold text-sm flex items-center justify-center font-ui">
                    {toArabicDigits(surah.number)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#242B28] dark:text-[#F0F5F2] font-ui">
                        سورة {surah.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5EAE4] dark:bg-[#283731] text-[#145C46] dark:text-[#C5A45D]">
                        {getRevelationTypeArabic(surah.revelationType)}
                      </span>
                    </div>
                    <div className="text-xs text-[#777F79] dark:text-[#95A39B] flex items-center gap-2 mt-0.5">
                      <span>{surah.englishName}</span>
                      <span>•</span>
                      <span>{toArabicDigits(surah.numberOfAyahs)} آية</span>
                      <span>•</span>
                      <span>صفحة {toArabicDigits(surah.startPage)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                  <button
                    onClick={(e) => handlePlay(surah.number, e)}
                    title="استماع"
                    className="p-2 rounded-lg bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] hover:bg-[#145C46] hover:text-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRead(surah.number)}
                    title="قراءة"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#145C46] text-white text-xs font-medium hover:bg-[#1E7558] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>اقرأ</span>
                    <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#FAFAF6] dark:bg-[#121B18] border-t border-[#E2E8E1] dark:border-[#24352D] text-xs text-[#777F79] dark:text-[#95A39B] flex justify-between items-center">
          <span>اضغط على أي سورة لبدء القراءة فوراً</span>
          <span className="hidden sm:inline">ESC للإغلاق</span>
        </div>
      </div>
    </div>
  );
};
