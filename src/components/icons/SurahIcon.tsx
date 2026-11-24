const SurahsIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5.5C9.5 3.8 6.5 3.5 3 4.5v14c3.5-1 6.5-.7 9 1" />
    <path d="M12 5.5c2.5-1.7 5.5-2 9-1v14c-3.5-1-6.5-.7-9 1" />
    <path d="M12 5.5v14" />
    <path d="M6.5 8h2.5" />
    <path d="M6.5 11h2.5" />
    <path d="M15 8h2.5" />
    <path d="M15 11h2.5" />
  </svg>
);

export default SurahsIcon;