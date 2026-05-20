// VerseLy Feather Logo — Inline SVG component
// A clean, literary quill feather that works on both light and dark backgrounds.
// Uses currentColor so it inherits the text color from its parent, or accepts
// an explicit color/className prop.

const VerselyLogo = ({ size = 28, className = '', color }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Feather quill — a single elegant stroke */}
      <defs>
        <linearGradient id="feather-grad" x1="12" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color || 'var(--accent-active, #E6B98F)'} />
          <stop offset="100%" stopColor={color || 'var(--accent, #C98B5A)'} />
        </linearGradient>
      </defs>
      {/* Main feather body */}
      <path
        d="M36.5 5C30 8 24 14 20 21C16 28 14 34 13.5 38C13.3 39.5 13.5 40.5 14 41C14.5 41.5 15 41.5 16 41C18 40 21 37 24 33C27 29 30 24 32.5 18.5C35 13 36.5 8 36.5 5Z"
        fill="url(#feather-grad)"
        opacity="0.9"
      />
      {/* Feather spine / rachis */}
      <path
        d="M36 6C32 12 26 22 21 30C17.5 35.5 15 39 14.5 40"
        stroke={color || 'var(--accent, #C98B5A)'}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Subtle quill tip at bottom */}
      <path
        d="M14.5 40C14 41.5 12.5 43 11 44"
        stroke={color || 'var(--accent, #C98B5A)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Barb detail lines */}
      <path
        d="M28 14C25 15.5 22 18 20 21"
        stroke={color || 'var(--accent-active, #E6B98F)'}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path
        d="M31 11C28 13 25 16 23 19"
        stroke={color || 'var(--accent-active, #E6B98F)'}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
    </svg>
  )
}

export default VerselyLogo
