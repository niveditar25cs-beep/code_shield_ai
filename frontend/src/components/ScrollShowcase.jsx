/**
 * ScrollShowcase.jsx
 * Pinned scroll-zoom with CSS variable --p (no setState per frame).
 * DashboardMockup is aria-hidden with figure caption.
 * Falls back to static layout on reduced-motion or no sticky support.
 */

import { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

const STEPS = [
  {
    caption: 'Enter a package name',
    desc: 'Type any Python package name — exactly as an AI assistant suggested it.',
    input: 'fakepkg-ai-utils',
    showInput: true,
    showResult: false,
    showEvidence: false,
    showSimilar: false,
    statusClass: '',
  },
  {
    caption: 'Registry evidence is collected',
    desc: 'CodeShield queries the PyPI registry and extracts version, release history, and project links.',
    input: 'fakepkg-ai-utils',
    showInput: true,
    showResult: false,
    showEvidence: true,
    showSimilar: false,
    statusClass: '',
  },
  {
    caption: 'Similar names are compared',
    desc: 'We compare the name against ~150 popular packages to spot lookalikes.',
    input: 'fakepkg-ai-utils',
    showInput: true,
    showResult: false,
    showEvidence: true,
    showSimilar: true,
    statusClass: '',
  },
  {
    caption: 'Get a clear, explainable result',
    desc: 'A status, evidence, and a recommended next step — no guesswork.',
    input: 'requests',
    showInput: true,
    showResult: true,
    showEvidence: true,
    showSimilar: false,
    statusClass: 'green',
  },
];

// Pure HTML/CSS DashboardMockup (aria-hidden)
function DashboardMockup({ step }) {
  return (
    <div className="dash-mockup" role="presentation" aria-hidden="true">
      {/* Title bar */}
      <div className="dash-mockup-header">
        <div className="dash-mockup-dots">
          <div className="dash-dot dash-dot-red" />
          <div className="dash-dot dash-dot-amber" />
          <div className="dash-dot dash-dot-green" />
        </div>
        <div className="dash-mockup-bar">
          {step.showInput ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
              › {step.input}
            </span>
          ) : (
            <span>codeshield.ai / analyze</span>
          )}
        </div>
      </div>

      {/* Status banner */}
      {step.showResult && (
        <div className={`dash-status-banner ${step.statusClass}`} style={{ marginBottom: '8px' }}>
          <span>✓</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.06em' }}>
            VERIFIED IN REGISTRY
          </span>
        </div>
      )}

      <div className="dash-mockup-body">
        <div className="dash-mockup-main">
          {/* Evidence blocks */}
          {step.showEvidence ? (
            <>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                {['Latest version', 'Release count', 'First release', 'Project links'].map((label) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px', background: 'var(--color-surface-3)',
                    borderRadius: '6px', border: '1px solid var(--color-border)'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', width: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    <div style={{ flex: 1, height: '10px', background: 'var(--color-surface-2)', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="dash-block dash-block-md" />
              <div className="dash-block dash-block-lg" />
            </>
          )}
        </div>

        <div className="dash-mockup-side">
          {step.showSimilar ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Similar packages</div>
              {['requests', 'urllib3', 'httpx'].map((pkg) => (
                <div key={pkg} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 8px', background: 'var(--color-surface-3)',
                  borderRadius: '5px', border: '1px solid var(--color-border)'
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', flex: 1 }}>{pkg}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-amber)', fontWeight: 700 }}>92%</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="dash-block dash-block-md" />
              <div className="dash-block dash-block-md" />
            </>
          )}

          {/* Chips */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
            {['requests', 'numpy', 'flask'].map((c) => (
              <div key={c} className="dash-chip">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScrollShowcase() {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const captionRefs = useRef([]);
  const mockupRef = useRef(null);
  const [isStatic, setIsStatic] = useState(false);
  const stepRef = useRef(0);

  // Check sticky + IntersectionObserver support
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      setIsStatic(true);
      return;
    }
    // Test sticky support
    const el = document.createElement('div');
    el.style.position = 'sticky';
    if (el.style.position !== 'sticky') {
      setIsStatic(true);
    }
  }, []);

  // Attach scroll progress
  useScrollProgress(trackRef);

  // rAF loop to read --p and update step/scale/captions
  useEffect(() => {
    if (isStatic) return;
    let rafId;
    let lastStep = -1;

    function tick() {
      const el = trackRef.current;
      if (el) {
        const p = parseFloat(el.style.getPropertyValue('--p') || '0');
        const step = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));

        // Scale: zoom from 0.75 to 1 as p goes 0->1
        const scale = 0.75 + p * 0.25;
        if (mockupRef.current) {
          mockupRef.current.style.transform = `scale(${scale.toFixed(4)})`;
        }

        // Parallax for chips
        const parallaxEls = el.querySelectorAll('.showcase-parallax');
        parallaxEls.forEach((pEl, i) => {
          const offset = (p * 60 * (i % 2 === 0 ? 1 : -1)).toFixed(2);
          pEl.style.transform = `translateY(${offset}px)`;
        });

        if (step !== lastStep) {
          lastStep = step;
          stepRef.current = step;

          // Update captions
          captionRefs.current.forEach((capEl, i) => {
            if (!capEl) return;
            if (i === step) {
              capEl.style.opacity = '1';
              capEl.style.transform = 'translateY(0)';
            } else {
              capEl.style.opacity = '0';
              capEl.style.transform = i < step ? 'translateY(-20px)' : 'translateY(20px)';
            }
          });
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isStatic]);

  // Static fallback
  if (isStatic) {
    return (
      <section className="scroll-showcase-static" aria-label="How CodeShield AI works">
        <figure>
          <figcaption className="sr-only">Illustration using sample data — not a real analysis</figcaption>
          {STEPS.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem' }}>
              <div className="section-eyebrow">Step {i + 1}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginBottom: '1rem' }}>
                {step.caption}
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{step.desc}</p>
              <DashboardMockup step={step} />
            </div>
          ))}
        </figure>
      </section>
    );
  }

  return (
    <section aria-label="How CodeShield AI works">
      <div ref={trackRef} className="scroll-showcase-track" style={{ '--p': '0' }}>
        <div ref={stickyRef} className="scroll-showcase-sticky">

          {/* Parallax chips */}
          <div className="showcase-chips showcase-parallax" style={{ top: '10%', left: '5%' }} aria-hidden="true">
            {['requests', 'numpy'].map((c) => (
              <div key={c} className="dash-chip">{c}</div>
            ))}
          </div>
          <div className="showcase-chips showcase-parallax" style={{ bottom: '15%', right: '5%' }} aria-hidden="true">
            {['flask', 'pandas', 'boto3'].map((c) => (
              <div key={c} className="dash-chip">{c}</div>
            ))}
          </div>

          {/* Grid background */}
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5 }} aria-hidden="true" />

          {/* Main stage */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <figure style={{ width: '100%' }}>
              <div ref={mockupRef} style={{ transformOrigin: 'center center', willChange: 'transform' }}>
                {/* We render the current step's mockup — rAF will update step */}
                <DashboardMockup step={STEPS[stepRef.current] || STEPS[0]} />
              </div>
              <figcaption className="sr-only">
                Illustration using sample data — not a real analysis
              </figcaption>
            </figure>

            {/* Captions */}
            <div className="scroll-showcase-caption-area" aria-live="polite" aria-atomic="true">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  ref={(el) => { captionRefs.current[i] = el; }}
                  className="scroll-showcase-caption"
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    transform: i === 0 ? 'none' : 'translateY(20px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                  }}
                  aria-hidden={i !== 0}
                >
                  {step.caption}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
