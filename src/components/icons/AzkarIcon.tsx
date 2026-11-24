const AzkarIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M32 10c11 0 18 8 18 18 0 13-18 26-18 26S14 41 14 28c0-10 7-18 18-18z" />

    <circle cx="32" cy="10" r="3" fill="currentColor" />
    <circle cx="20" cy="15" r="2.5" fill="currentColor" />
    <circle cx="44" cy="15" r="2.5" fill="currentColor" />
    <circle cx="14" cy="26" r="2.5" fill="currentColor" />
    <circle cx="50" cy="26" r="2.5" fill="currentColor" />
    <circle cx="18" cy="38" r="2.5" fill="currentColor" />
    <circle cx="46" cy="38" r="2.5" fill="currentColor" />
    <circle cx="25" cy="47" r="2.5" fill="currentColor" />
    <circle cx="39" cy="47" r="2.5" fill="currentColor" />
    <circle cx="32" cy="54" r="3" fill="currentColor" />
  </svg>
);

export default AzkarIcon;