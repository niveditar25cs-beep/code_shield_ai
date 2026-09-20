/**
 * SectionDivider.jsx
 * 1px hairline divider with horizontal gradient (transparent -> blue -> violet -> cyan -> transparent)
 * at low opacity with a centered glowing jewel dot.
 * Draws in with a subtle scaleX reveal on scroll (transform only, once).
 * Static under prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';

export default function SectionDivider({ className = '' }) {
  const lineRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={lineRef}
      className={`section-divider-wrapper ${className}`}
      role="separator"
      aria-hidden="true"
    >
      <div className="section-divider-inner">
        <div
          className={`section-divider-line ${revealed ? 'revealed' : ''}`}
        />
        <div className={`section-divider-dot ${revealed ? 'revealed' : ''}`} />
      </div>
    </div>
  );
}
