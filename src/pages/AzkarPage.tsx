import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Flame,
  Bed,
  Sunrise,
  RotateCcw,
  Check,
  Copy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AZKAR_CATEGORIES, AZKAR_DATA } from '../data/azkarData';
import { DhikrCategoryKey, DhikrItem } from '../types/quran';
import { toArabicDigits } from '../utils/quranUtils';
import { sanitizeAzkarCounts, safeCopyToClipboard } from '../utils/securityUtils';

const AZKAR_STORAGE_KEY = 'holy_quran_azkar_counts_v1';

export const AzkarPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DhikrCategoryKey>('morning');
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(AZKAR_STORAGE_KEY);
      if (saved) return sanitizeAzkarCounts(JSON.parse(saved));
    } catch {
      // ignore
    }
    return {};
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(AZKAR_STORAGE_KEY, JSON.stringify(counts));
    } catch (e) {
      // ignore
    }
  }, [counts]);

  const categoryDhikrs = AZKAR_DATA.filter((d) => d.category === activeCategory);

  const getDhikrCount = (id: string): number => {
    return counts[id] || 0;
  };

  const handleIncrement = (item: DhikrItem) => {
    const current = getDhikrCount(item.id);
    if (current < item.count) {
      setCounts((prev) => ({
        ...prev,
        [item.id]: current + 1
      }));
    }
  };

  const handleResetCategory = () => {
    setCounts((prev) => {
      const updated = { ...prev };
      categoryDhikrs.forEach((d) => {
        delete updated[d.id];
      });
      return updated;
    });
  };

  const handleCopy = async (item: DhikrItem) => {
    const ok = await safeCopyToClipboard(item.text);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Progress metrics for category
  const completedCount = categoryDhikrs.filter(
    (d) => getDhikrCount(d.id) >= d.count
  ).length;
  const progressPercent = categoryDhikrs.length > 0 ? (completedCount / categoryDhikrs.length) * 100 : 0;

  const getCategoryIcon = (key: DhikrCategoryKey) => {
    switch (key) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'evening':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'after_prayer':
        return <Flame className="w-4 h-4 text-emerald-500" />;
      case 'sleep':
        return <Bed className="w-4 h-4 text-purple-400" />;
      case 'wake':
        return <Sunrise className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-ui">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] text-xs font-semibold">
          <span>الأذكار النبوية الصحيحة</span>
        </div>
        <h1 className="font-quran text-3xl sm:text-5xl font-bold text-[#242B28] dark:text-[#F0F5F2]">
          أَذْكَارُ الْمُسْلِمِ
        </h1>
        <p className="text-sm sm:text-base text-[#777F79] dark:text-[#95A39B] max-w-xl mx-auto">
          أذكار الصباح والمساء وأدعية اليوم والليلة الصحيحة المأثورة عن رسول الله ﷺ مع عداد تفاعلي للتكرار
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8E1] dark:border-[#24352D]">
        {AZKAR_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${isActive
                  ? 'bg-[#145C46] text-white shadow-md shadow-[#145C46]/20'
                  : 'bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] text-[#242B28] dark:text-[#F0F5F2] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27]'
                }`}
            >
              {getCategoryIcon(cat.key)}
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Card & Reset Button */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#242B28] dark:text-[#F0F5F2] mb-2">
            <span>
              الإنجاز: {toArabicDigits(completedCount)} من {toArabicDigits(categoryDhikrs.length)} ذكر
            </span>
            <span className="text-[#145C46] dark:text-[#C5A45D]">
              {toArabicDigits(Math.round(progressPercent))}٪
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#145C46] to-[#C5A45D] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleResetCategory}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#777F79] dark:text-[#95A39B] hover:text-[#145C46] dark:hover:text-[#C5A45D] border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] hover:bg-gray-100 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط العدادات</span>
        </button>
      </div>

      {/* Dhikrs List */}
      <div className="space-y-4">
        {categoryDhikrs.map((item, idx) => {
          const count = getDhikrCount(item.id);
          const isCompleted = count >= item.count;
          const remaining = Math.max(0, item.count - count);

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50'
                  : 'bg-white dark:bg-[#16221E] border-[#E2E8E1] dark:border-[#24352D] hover:border-[#145C46]/40'
                }`}
            >
              {/* Top Bar: Number & Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] font-bold text-xs flex items-center justify-center">
                    {toArabicDigits(idx + 1)}
                  </span>
                  <span className="text-xs text-[#777F79] dark:text-[#95A39B]">
                    عدد المرات: {toArabicDigits(item.count)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-2 rounded-xl text-[#777F79] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="نسخ الذكر"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dhikr Arabic Text */}
              <p className="font-quran text-xl sm:text-2xl text-[#242B28] dark:text-[#F0F5F2] leading-loose text-center py-2 select-text">
                {item.text}
              </p>

              {/* Fadl / Virtue if available */}
              {(item.fadl || item.source) && (
                <div className="mt-4 p-3 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1]/60 dark:border-[#24352D]/60 text-xs text-[#777F79] dark:text-[#95A39B] space-y-1">
                  {item.fadl && (
                    <div className="flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A45D] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.fadl}</span>
                    </div>
                  )}
                  {item.source && (
                    <div className="text-[11px] text-[#145C46] dark:text-[#C5A45D] font-medium">
                      المصدر: {item.source}
                    </div>
                  )}
                </div>
              )}

              {/* Counter Tap Button */}
              <div className="mt-5 pt-4 border-t border-[#E2E8E1]/60 dark:border-[#24352D]/60 flex items-center justify-between">
                <span className="text-xs text-[#777F79] dark:text-[#95A39B]">
                  {isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اكتمل الذكر بفضل الله</span>
                    </span>
                  ) : (
                    <span>المتبقي: {toArabicDigits(remaining)} مرة</span>
                  )}
                </span>

                <button
                  onClick={() => handleIncrement(item)}
                  disabled={isCompleted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-sm ${isCompleted
                      ? 'bg-emerald-600 text-white disabled:cursor-default'
                      : 'bg-[#145C46] hover:bg-[#1E7558] text-white hover:scale-105'
                    }`}
                >
                  {isCompleted ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تم ({toArabicDigits(item.count)})</span>
                    </>
                  ) : (
                    <>
                      <span>اضغط للتسبيح</span>
                      <span className="px-2 py-0.5 rounded-lg bg-black/20 text-xs">
                        {toArabicDigits(count)} / {toArabicDigits(item.count)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
