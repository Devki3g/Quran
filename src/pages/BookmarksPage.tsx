import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  BookOpen,
  Copy,
  Check,
  Share2,
  Calendar,
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { toArabicDigits } from '../utils/quranUtils';
import { safeCopyToClipboard } from '../utils/securityUtils';

export const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark } = useQuranSettings();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (b: { id: string; surahName: string; ayahNumber: number; text: string }) => {
    const formatted = `﴿${b.text}﴾ [سورة ${b.surahName}: الآية ${toArabicDigits(b.ayahNumber)}]`;
    const ok = await safeCopyToClipboard(formatted);
    if (ok) {
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (b: { id: string; surahNumber: number; surahName: string; ayahNumber: number; text: string }) => {
    const formatted = `﴿${b.text}﴾ [سورة ${b.surahName}: الآية ${toArabicDigits(b.ayahNumber)}]`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${b.surahName} - الآية ${b.ayahNumber}`,
          text: formatted,
          url: `${window.location.origin}/quran/${b.surahNumber}`
        });
      } catch (err) {
        // ignore
      }
    } else {
      handleCopy(b);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] text-xs font-semibold font-ui">
          <span>العلامات المرجعية المحفوظة</span>
        </div>
        <h1 className="font-quran text-3xl sm:text-5xl font-bold text-[#242B28] dark:text-[#F0F5F2]">
          الآيَاتُ الْمَحْفُوظَةُ
        </h1>
        <p className="font-ui text-sm sm:text-base text-[#777F79] dark:text-[#95A39B]">
          قائمتك الخاصة بالآيات الكريمة التي قمت بحفظها أثناء التلاوة للرجوع إليها وتدبرها
        </p>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl text-[#242B28] dark:text-[#F0F5F2] font-ui">
            لا توجد علامات مرجعية محفوظة حتى الآن
          </h3>
          <p className="text-sm text-[#777F79] dark:text-[#95A39B] max-w-md mx-auto font-ui">
            أثناء قراءتك في المصحف، يمكنك النقر على أي آية أو رقمها ثم الضغط على زر "حفظ" لتظهر هنا وتتمكن من الرجوع إليها سريعاً.
          </p>
          <button
            onClick={() => navigate('/quran/1')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#145C46] hover:bg-[#1E7558] text-white font-bold text-sm shadow-md transition-all font-ui"
          >
            <BookOpen className="w-4 h-4" />
            <span>الانتقال إلى المصحف للبدء</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[#777F79] dark:text-[#95A39B] font-ui px-2">
            <span>إجمالي الآيات المحفوظة: {toArabicDigits(bookmarks.length)} آية</span>
            <span>يتم الحفظ تلقائياً في ذاكرة المتصفح</span>
          </div>

          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/40 dark:hover:border-[#C5A45D]/40 shadow-xs transition-all flex flex-col justify-between"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60 mb-4 font-ui">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#145C46] text-[#C5A45D] font-bold text-xs flex items-center justify-center">
                    {toArabicDigits(b.ayahNumber)}
                  </div>
                  <div>
                    <span className="font-bold text-base text-[#242B28] dark:text-[#F0F5F2]">
                      سورة {b.surahName}
                    </span>
                    <span className="text-xs text-[#777F79] dark:text-[#95A39B] ms-2">
                      (الآية {toArabicDigits(b.ayahNumber)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(b)}
                    className="p-2 rounded-xl text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="نسخ الآية"
                  >
                    {copiedId === b.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleShare(b)}
                    className="p-2 rounded-xl text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removeBookmark(b.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="إزالة من المحفوظات"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ayah Text */}
              <p className="font-quran text-2xl sm:text-3xl text-[#242B28] dark:text-[#F0F5F2] leading-loose text-center py-2">
                ﴿ {b.text} ﴾
              </p>

              {/* Footer action to jump to this Ayah */}
              <div className="mt-4 pt-3 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center justify-between font-ui">
                <span className="text-[11px] text-[#777F79] dark:text-[#95A39B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الحفظ: {new Date(b.createdAt).toLocaleDateString('ar-EG')}</span>
                </span>

                <button
                  onClick={() => navigate(`/quran/${b.surahNumber}?ayah=${b.ayahNumber}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#145C46] hover:bg-[#1E7558] text-white text-xs font-semibold transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>فتح السورة وقراءة الآية في المصحف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
