// VerseLy Wordmark — Refined brand text
// Uses the heading font with tight tracking for a premium editorial feel.
// The "Ly" can optionally be accented for subtle brand differentiation.

const VerselyWordmark = ({ size = 'md', className = '', accentSuffix = true }) => {
  const sizes = {
    sm: 'text-[14px]',
    md: 'text-[16px]',
    lg: 'text-[20px]',
    xl: 'text-[28px]',
    '2xl': 'text-[36px]',
    hero: 'text-[42px] sm:text-[56px]',
  }

  return (
    <span
      className={`font-semibold tracking-[-0.03em] leading-none ${sizes[size] || sizes.md} ${className}`}
      style={{ fontFamily: 'var(--font-heading, var(--font-sans))' }}
    >
      <span className="text-[var(--text)]">Verse</span>
      {accentSuffix ? (
        <span className="text-[var(--accent)]">Ly</span>
      ) : (
        <span className="text-[var(--text)]">Ly</span>
      )}
    </span>
  )
}

export default VerselyWordmark
