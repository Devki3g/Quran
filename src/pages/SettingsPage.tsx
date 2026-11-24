import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  Type,
  BookOpen,
  Volume2,
  Trash2,
  Check,
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { toArabicDigits } from '../utils/quranUtils';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    bookmarks,
    clearHistory
  } = useQuranSettings();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const getFontFamilyClass = (family: string) => {
    switch (family) {
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
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-ui">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#145C46]/10 dark:bg-[#C5A45D]/15 text-[#145C46] dark:text-[#C5A45D] text-xs font-semibold">
          <span>إعدادات التطبيق وتخصيص القراءة</span>
        </div>
        <h1 className="font-quran text-3xl sm:text-5xl font-bold text-[#242B28] dark:text-[#F0F5F2]">
          الْإِعْدَادَاتُ
        </h1>
        <p className="text-sm sm:text-base text-[#777F79] dark:text-[#95A39B]">
          تخصيص المظهر، خطوط المصحف، خيارات التلاوة، وإدارة بيانات القراءة المحفوظة
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* 1. Theme / Appearance */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60">
            <Moon className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <h2 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2]">
              مظهر التطبيق (السمة)
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'الوضع النهاري', icon: Sun },
              { id: 'dark', label: 'الوضع الليلي', icon: Moon },
              { id: 'system', label: 'تلقائي (النظام)', icon: Monitor }
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id as any })}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'border-[#145C46] dark:border-[#C5A45D] bg-[#145C46]/5 dark:bg-[#C5A45D]/10 text-[#145C46] dark:text-[#C5A45D] font-bold ring-2 ring-[#145C46]/20'
                      : 'border-[#E2E8E1] dark:border-[#24352D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] text-[#242B28] dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Quran Typography & Font Sizing */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60">
            <Type className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <h2 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2]">
              تخصيص الخط القرآني
            </h2>
          </div>

          {/* Font Family Chooser */}
          <div>
            <label className="text-xs text-[#777F79] dark:text-[#95A39B] block mb-2">
              نوع الخط المعتمد لنصوص الآيات:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'amiri-quran', label: 'العثماني المصحفي' },
                { id: 'amiri', label: 'خط الأميري' },
                { id: 'cairo', label: 'خط القاهرة' },
                { id: 'tajawal', label: 'خط تجوال' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateSettings({ quranFontFamily: f.id as any })}
                  className={`px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                    settings.quranFontFamily === f.id
                      ? 'bg-[#145C46] text-white border-[#145C46] font-bold shadow-xs'
                      : 'border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#242B28] dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex justify-between items-center text-xs text-[#777F79] dark:text-[#95A39B] mb-2">
              <span>حجم الخط القرآني أثناء القراءة</span>
              <span className="font-bold text-[#145C46] dark:text-[#C5A45D] text-sm">
                {toArabicDigits(settings.quranFontSize)} بكسل
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#777F79]">صغير</span>
              <input
                type="range"
                min="20"
                max="44"
                step="2"
                value={settings.quranFontSize}
                onChange={(e) => updateSettings({ quranFontSize: Number(e.target.value) })}
                className="w-full accent-[#145C46] dark:accent-[#C5A45D] cursor-pointer"
              />
              <span className="text-xs text-[#777F79]">كبير</span>
            </div>
          </div>

          {/* Live Quran Text Preview Box */}
          <div className="p-5 rounded-2xl bg-[#FAFAF6] dark:bg-[#121B18] border border-[#E2E8E1] dark:border-[#24352D] text-center space-y-2">
            <span className="text-xs text-[#777F79] dark:text-[#95A39B] block">معاينة مباشرة:</span>
            <p
              className={`text-[#242B28] dark:text-[#F0F5F2] leading-loose ${getFontFamilyClass(
                settings.quranFontFamily
              )}`}
              style={{ fontSize: `${settings.quranFontSize}px` }}
            >
              ﴿ إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ ﴾
            </p>
          </div>
        </section>

        {/* 3. Reading Mode & Display */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60">
            <BookOpen className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <h2 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2]">
              نمط عرض صفحات المصحف
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => updateSettings({ readingMode: 'mushaf' })}
              className={`p-4 rounded-xl border text-right transition-all ${
                settings.readingMode === 'mushaf'
                  ? 'border-[#145C46] dark:border-[#C5A45D] bg-[#145C46]/5 dark:bg-[#C5A45D]/10 text-[#145C46] dark:text-[#C5A45D] ring-2 ring-[#145C46]/20'
                  : 'border-[#E2E8E1] dark:border-[#24352D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] text-[#242B28] dark:text-gray-300'
              }`}
            >
              <div className="font-bold text-sm mb-1">نمط المصحف الشريف المتصل (موصى به)</div>
              <div className="text-xs text-[#777F79] dark:text-[#95A39B]">
                عرض الآيات أفقياً في فقرات متصلة تحاكي تجربة قراءة المصحف الورقي بدقة.
              </div>
            </button>

            <button
              onClick={() => updateSettings({ readingMode: 'ayahs' })}
              className={`p-4 rounded-xl border text-right transition-all ${
                settings.readingMode === 'ayahs'
                  ? 'border-[#145C46] dark:border-[#C5A45D] bg-[#145C46]/5 dark:bg-[#C5A45D]/10 text-[#145C46] dark:text-[#C5A45D] ring-2 ring-[#145C46]/20'
                  : 'border-[#E2E8E1] dark:border-[#24352D] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] text-[#242B28] dark:text-gray-300'
              }`}
            >
              <div className="font-bold text-sm mb-1">نمط البطاقات المنفصلة</div>
              <div className="text-xs text-[#777F79] dark:text-[#95A39B]">
                عرض كل آية في بطاقة مستقلة مع رقمها وخيارات النسخ والمشاركة المباشرة.
              </div>
            </button>
          </div>
        </section>

        {/* 4. Audio Preferences */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-[#E2E8E1] dark:border-[#24352D] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8E1]/60 dark:border-[#24352D]/60">
            <Volume2 className="w-5 h-5 text-[#145C46] dark:text-[#C5A45D]" />
            <h2 className="font-bold text-lg text-[#242B28] dark:text-[#F0F5F2]">
              خيارات التلاوة والصوتيات
            </h2>
          </div>

          <div>
            <label className="text-xs text-[#777F79] dark:text-[#95A39B] block mb-2">
              سرعة التلاوة الافتراضية:
            </label>
            <div className="flex items-center gap-2">
              {[0.75, 1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => updateSettings({ playbackSpeed: spd })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    settings.playbackSpeed === spd
                      ? 'bg-[#145C46] text-white border-[#145C46]'
                      : 'border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#1E2D27] text-[#242B28] dark:text-gray-300'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Data & Reading History Management */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#16221E] border border-red-200 dark:border-red-900/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-100 dark:border-red-900/40">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="font-bold text-lg text-red-700 dark:text-red-400">
              إدارة البيانات وسجل القراءة
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#242B28] dark:text-[#F0F5F2]">
                مسح سجل القراءة والعلامات المرجعية
              </p>
              <p className="text-xs text-[#777F79] dark:text-[#95A39B] mt-1">
                سيتم حذف آخر موضع توقفت عنده وجميع الآيات المحفوظة في ذاكرة المتصفح ({toArabicDigits(bookmarks.length)} آية).
              </p>
            </div>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors shrink-0"
              >
                مسح البيانات
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  تأكيد المسح
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700 dark:text-gray-300"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>

          {clearedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>تم مسح سجل القراءة والعلامات المرجعية بنجاح.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
