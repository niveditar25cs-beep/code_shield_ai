/**
 * TextRoll.jsx
 * Per-character roll-in animation.
 * Uses CSS ::after for the duplicate letter.
 * sr-only full text once. aria-hidden visual layer.
 * Max 60 chars. Hover re-roll on pointer devices.
 */

import { useEffect, useRef, useState } from 'react';

const MAX_CHARS = 60;

export default function TextRoll({ text, as: Tag = 'span', className = '' }) {
  const [rolling, setRolling] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const hasRolled = useRef(false);

  const displayText = text.slice(0, MAX_CHARS);
  const chars = [...displayText];

  // Trigger roll-in once on enter viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    if (!('IntersectionObserver' in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRolled.current) {
          hasRolled.current = true;
          setRolling(true);
          // Reset after animation completes
          const totalDuration = chars.length * 40 + 500;
          setTimeout(() => setRolling(false), totalDuration);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [chars.length]);

  return (
    <Tag className={`text-roll ${className}`} ref={containerRef} data-rolling={rolling}>
      {/* Screen reader text */}
      <span className="sr-only">{displayText}</span>
      {/* Visual layer — aria-hidden */}
      <span className="text-roll-inner" aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={i}
            className={`text-roll-char${char === ' ' ? ' space' : ''}`}
            style={{
              animationDelay: rolling ? `${i * 40}ms` : undefined,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </Tag>
  );
}
