import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

/**
 * Unified section banner header used across all sections of the application
 * for consistent archival Mushaf framing, typography, and spacing.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  kicker,
  title,
  subtitle,
  children,
  compact = false
}) => {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-[#16221E] text-[#242B28] dark:text-[#F0F5F2] shadow-xs border border-[#E2E8E1] dark:border-[#24352D] text-center ${
        compact ? 'px-6 py-8 sm:py-10 sm:px-10' : 'px-6 py-10 sm:py-14 sm:px-12'
      }`}
    >
      <div className="absolute inset-0 bg-islamic-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-2.5 sm:inset-3 rounded-2xl border border-[#C5A45D]/25 pointer-events-none" />

      {/* Decorative corner stars */}
      <div
        className="absolute top-3.5 right-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none"
        aria-hidden="true"
      >
        ✦
      </div>
      <div
        className="absolute top-3.5 left-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none"
        aria-hidden="true"
      >
        ✦
      </div>
      <div
        className="absolute bottom-3.5 right-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none"
        aria-hidden="true"
      >
        ✦
      </div>
      <div
        className="absolute bottom-3.5 left-4 text-[#C5A45D] opacity-60 text-lg select-none pointer-events-none"
        aria-hidden="true"
      >
        ✦
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center gap-2 text-[#145C46] dark:text-[#C5A45D] text-xs sm:text-sm font-semibold font-ui">
          {icon}
          <span>{kicker}</span>
        </div>

        <h1
          className={`font-quran font-bold tracking-wide text-[#145C46] dark:text-[#F0F5F2] ${
            compact ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl'
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="font-ui text-sm sm:text-base text-[#777F79] dark:text-[#95A39B] leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  );
};
