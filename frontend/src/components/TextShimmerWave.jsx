/**
 * TextShimmerWave.jsx
 * Per-character wave shimmer — translateY/scale + opacity overlay.
 * No 3D, no blur. Only used for in-progress states.
 * Max 2 instances at once (enforced by usage guidelines).
 */

export default function TextShimmerWave({ text, className = '' }) {
  const chars = [...text];

  return (
    <span className={`shimmer-wave ${className}`} aria-label={text}>
      <span aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={i}
            className={`shimmer-char${char === ' ' ? ' space' : ''}`}
            style={{
              animationDelay: `${i * 80}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}
