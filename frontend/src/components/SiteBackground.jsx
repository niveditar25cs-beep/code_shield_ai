/**
 * SiteBackground.jsx
 * Continuous site-wide background for CodeShield AI.
 *
 * Layers (bottom to top):
 * 1. Base navy gradient (#050816 to #0B1230) with soft radial glows in blue, violet, and cyan.
 * 2. Image slot: src/assets/bg/site-bg.webp at 0.35 opacity (falls back gracefully).
 * 3. Drifting wireframe glass cubes (clearly visible, stroke ~0.3-0.4 opacity, slow drift) +
 *    code-rain canvas (alpha 0.25-0.5, center calmer, animated falling).
 * 4. Readability overlay: lighter vignette so background stays visible.
 *
 * Parallax scroll drift: translateY ~0.06x of scroll (transform only).
 * Performance: 30 fps cap (20 on mobile/low-core), devicePixelRatio <= 1.5,
 * visibilitychange pause, prefers-reduced-motion static render.
 */

import { useEffect, useRef, useState } from 'react';

// Safely probe for optional background image without build errors if missing
const bgGlob = import.meta.glob('../assets/bg/site-bg.webp', { eager: true, as: 'url' });
const OPTIONAL_BG_URL = bgGlob['../assets/bg/site-bg.webp'] || null;

const CODE_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ{}<>/%&#;:=+*!~';
const CODE_WORDS = ['import', 'pip', 'PyPI', 'def', 'async', 'verify', 'hash', 'sha256', 'guard', 'AST'];

const RAIN_COLORS = [
  'rgba(34, 211, 238, ',  // Cyan
  'rgba(56, 189, 248, ',  // Sky Blue
  'rgba(99, 179, 237, ',  // Light Blue
  'rgba(168, 85, 247, ',  // Violet
  'rgba(192, 132, 252, ', // Lavender
  'rgba(74, 222, 128, ',  // Emerald Green (occasional)
];

export default function SiteBackground() {
  const canvasRef = useRef(null);
  const parallaxRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Detect environment & hardware capability
    const isMobile = window.innerWidth < 768;
    const isLowCore = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targetFps = isMobile || isLowCore ? 20 : 30;
    const frameInterval = 1000 / targetFps;
    const densityFactor = isMobile || isLowCore ? 0.4 : 1.0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let lastFrameTime = performance.now();
    let isTabVisible = !document.hidden;

    // Columns configuration
    const fontSize = isMobile ? 14 : 16;
    const columnWidth = isMobile ? 28 : 24;
    let columns = [];

    const initColumns = () => {
      const colCount = Math.floor(width / columnWidth);
      columns = [];
      for (let i = 0; i < colCount; i++) {
        // Center calm factor: center columns sparser/dimmer, edges denser/brighter
        const centerDistance = Math.abs(i - colCount / 2) / (colCount / 2); // 0=center, 1=edges
        const isCenter = centerDistance < 0.4;

        // Keep more columns visible — edges show ~80%, center ~35%
        if (isCenter && Math.random() > 0.35 * densityFactor) {
          continue;
        } else if (!isCenter && Math.random() > 0.80 * densityFactor) {
          continue;
        }

        columns.push({
          x: i * columnWidth + (Math.random() * 4 - 2),
          y: Math.random() * height, // start scattered across the whole screen
          speed: (0.5 + Math.random() * 1.2) * (isCenter ? 0.6 : 1.0),
          length: Math.floor(6 + Math.random() * 16),
          chars: [],
          colorBase: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
          // RAISED alpha: center 0.20-0.32, edges 0.30-0.50
          baseAlpha: isCenter ? 0.20 + Math.random() * 0.12 : 0.30 + Math.random() * 0.20,
        });
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initColumns();
    };

    resizeCanvas();

    // Render single frame logic
    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        // Build up chars to trail length
        if (col.chars.length < col.length) {
          if (Math.random() < 0.10) {
            const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
            col.chars.push(...word.split(''));
          } else {
            col.chars.push(CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]);
          }
        }

        // Randomly mutate a char in the trail (flicker effect)
        if (Math.random() < 0.03 && col.chars.length > 1) {
          const mutIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[mutIdx] = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        }

        // Draw trail
        for (let j = 0; j < col.chars.length; j++) {
          const charY = col.y - (col.chars.length - 1 - j) * (fontSize + 3);
          if (charY < -20 || charY > height + 20) continue;

          // Head character is brightest
          const isHead = j === col.chars.length - 1;
          const fadeProgress = (j + 1) / col.chars.length;
          const alpha = isHead
            ? Math.min(0.65, col.baseAlpha * 2.0)
            : col.baseAlpha * fadeProgress;

          ctx.fillStyle = `${col.colorBase}${alpha.toFixed(3)})`;
          ctx.fillText(col.chars[j], col.x, charY);
        }

        // Move downward (animate!)
        if (!prefersReducedMotion) {
          col.y += col.speed;
          if (col.y - col.chars.length * (fontSize + 3) > height) {
            col.y = -Math.random() * 120;
            col.speed = 0.5 + Math.random() * 1.2;
            col.colorBase = RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)];
            col.chars = [];
          }
        }
      }
    };

    // If reduced motion, draw one single static frame only
    if (prefersReducedMotion) {
      // Populate chars so something is visible in static frame
      for (const col of columns) {
        while (col.chars.length < col.length) {
          col.chars.push(CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]);
        }
      }
      drawFrame();
      return () => {};
    }

    // Animation Loop throttled to targetFps
    const animate = (timestamp) => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);
        drawFrame();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Pause on visibility change
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastFrameTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Debounced ResizeObserver
    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (prefersReducedMotion) drawFrame();
      }, 150);
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  // Parallax scroll effect (translateY ~0.06x of scroll, transform only)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !parallaxRef.current) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const translateY = (scrollY * 0.06).toFixed(2);
          parallaxRef.current.style.transform = `translate3d(0, -${translateY}px, 0)`;
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="site-background-root"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Layer 1: Base deep navy gradient + stronger radial glows */}
      <div
        className="site-bg-base"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 15% 20%, rgba(34, 211, 238, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 85% 30%, rgba(168, 85, 247, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 50% 85%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
            linear-gradient(180deg, #050816 0%, #070d24 45%, #0B1230 100%)
          `,
        }}
      />

      {/* Parallax Container for drifting layers (Image + 3D Cubes) */}
      <div
        ref={parallaxRef}
        className="site-bg-parallax"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '125%',
          willChange: 'transform',
        }}
      >
        {/* Layer 2: Background image at 0.35 opacity */}
        {OPTIONAL_BG_URL && !imageError && (
          <img
            src={OPTIONAL_BG_URL}
            alt=""
            onError={() => setImageError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.35,
              filter: 'saturate(1.3) contrast(1.15)',
            }}
          />
        )}

        {/* Clearly visible wireframe glass cubes with strong glow and slow drift */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Cube 1 (Top Left) — Cyan, larger, brighter */}
          <svg
            className="wireframe-cube cube-1"
            viewBox="0 0 120 120"
            style={{
              position: 'absolute',
              top: '10%',
              left: '6%',
              width: '180px',
              height: '180px',
              opacity: 0.40,
              filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
              animation: 'floatCube1 22s ease-in-out infinite alternate',
            }}
          >
            <polygon points="60,10 110,38 60,66 10,38" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.45)" strokeWidth="1.5" />
            <polygon points="10,38 60,66 60,110 10,82" fill="rgba(34,211,238,0.03)" stroke="rgba(56,189,248,0.35)" strokeWidth="1.5" />
            <polygon points="60,66 110,38 110,82 60,110" fill="rgba(34,211,238,0.05)" stroke="rgba(96,165,250,0.40)" strokeWidth="1.5" />
            <line x1="60" y1="10" x2="60" y2="66" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
          </svg>

          {/* Cube 2 (Right Mid) — Violet, clearly visible */}
          <svg
            className="wireframe-cube cube-2"
            viewBox="0 0 120 120"
            style={{
              position: 'absolute',
              top: '38%',
              right: '7%',
              width: '200px',
              height: '200px',
              opacity: 0.38,
              filter: 'drop-shadow(0 0 22px rgba(168, 85, 247, 0.5))',
              animation: 'floatCube2 26s ease-in-out infinite alternate',
            }}
          >
            <polygon points="60,12 108,40 60,68 12,40" fill="rgba(168,85,247,0.06)" stroke="rgba(192,132,252,0.40)" strokeWidth="1.5" />
            <polygon points="12,40 60,68 60,108 12,80" fill="rgba(168,85,247,0.03)" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" />
            <polygon points="60,68 108,40 108,80 60,108" fill="rgba(168,85,247,0.06)" stroke="rgba(129,140,248,0.40)" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="4" fill="#c084fc" opacity="0.55" />
          </svg>

          {/* Cube 3 (Bottom Center-Left) — Blue, visible */}
          <svg
            className="wireframe-cube cube-3"
            viewBox="0 0 120 120"
            style={{
              position: 'absolute',
              top: '72%',
              left: '18%',
              width: '160px',
              height: '160px',
              opacity: 0.35,
              filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.5))',
              animation: 'floatCube3 20s ease-in-out infinite alternate',
            }}
          >
            <polygon points="60,15 105,40 60,65 15,40" fill="rgba(56,189,248,0.05)" stroke="rgba(56,189,248,0.40)" strokeWidth="1.5" />
            <polygon points="15,40 60,65 60,105 15,80" fill="rgba(56,189,248,0.03)" stroke="rgba(6,182,212,0.35)" strokeWidth="1.5" />
            <polygon points="60,65 105,40 105,80 60,105" fill="rgba(56,189,248,0.06)" stroke="rgba(59,130,246,0.40)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Layer 3: Code-rain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 4: LIGHT readability overlay — vignette edges only, center stays clear */}
      <div
        className="readability-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 85% 65% at 50% 50%, rgba(5, 8, 22, 0.10) 0%, rgba(4, 7, 20, 0.55) 100%)
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
