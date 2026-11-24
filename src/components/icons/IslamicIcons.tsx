import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Tasbih (prayer beads) SVG icon representing Azkar & Dhikr.
 */
export const AzkarTasbihIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Top beads arc */}
    <circle cx="12" cy="4.2" r="1.4" />
    <circle cx="16.3" cy="5.7" r="1.35" />
    <circle cx="18.8" cy="9.6" r="1.35" />
    <circle cx="18" cy="14" r="1.35" />
    <circle cx="7.7" cy="5.7" r="1.35" />
    <circle cx="5.2" cy="9.6" r="1.35" />
    <circle cx="6" cy="14" r="1.35" />
    {/* Bottom meeting bead (Imam bead) & tassel */}
    <path d="M9.1 16.9L12 18.2L14.9 16.9" />
    <circle cx="12" cy="18.3" r="1.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 19.8V22" />
    <path d="M10.4 21.8L12 20.5L13.6 21.8" />
  </svg>
);

/**
 * Mosque dome & minaret SVG icon representing Prayer / After-Prayer Azkar.
 */
export const MosqueIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3V5" />
    <path d="M12 5C9 7.2 7.5 9.6 7.5 12.5H16.5C16.5 9.6 15 7.2 12 5Z" />
    <path d="M4 20.5H20" />
    <path d="M5.5 20.5V12.5H18.5V20.5" />
    <path d="M10.2 20.5V16.8C10.2 15.8 11 15 12 15C13 15 13.8 15.8 13.8 16.8V20.5" />
    <path d="M4 12.5V9.5L5.2 8L6.4 9.5V12.5" />
  </svg>
);

/**
 * Rub el Hizb (۞) 8-pointed Islamic star SVG icon for Quranic divisions & virtues.
 */
export const RubElHizbIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5.5" y="5.5" width="13" height="13" rx="1" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="1" transform="rotate(45 12 12)" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/**
 * Open Mushaf on Rahle stand SVG icon.
 */
export const MushafStandIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 6.5C4.5 5 8.5 5 12 7C15.5 5 19.5 5 22 6.5V16.5C19.5 15 15.5 15 12 17C8.5 15 4.5 15 2 16.5Z" />
    <path d="M12 7V17" />
    <path d="M5 9.5C6.8 9 8.5 9 10 9.8" />
    <path d="M5 12.2C6.8 11.7 8.5 11.7 10 12.5" />
    <path d="M14 9.8C15.5 9 17.2 9 19 9.5" />
    <path d="M14 12.5C15.5 11.7 17.2 11.7 19 12.2" />
    <path d="M6.5 16.2L15.5 21.5" />
    <path d="M17.5 16.2L8.5 21.5" />
  </svg>
);
