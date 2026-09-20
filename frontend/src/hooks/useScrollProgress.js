/**
 * useScrollProgress.js
 * Pinned scroll-zoom progress hook.
 * 
 * Writes --p (0-1) to a CSS variable on the track element.
 * Uses a passive scroll listener + one rAF per frame.
 * No setState per tick — zero React re-renders during scroll.
 */

import { useEffect, useRef, useCallback } from 'react';

export function useScrollProgress(trackRef) {
  const rafRef = useRef(null);
  const geometryRef = useRef({ top: 0, height: 1 });

  const updateGeometry = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    geometryRef.current = {
      top: rect.top + scrollTop,
      height: el.offsetHeight - window.innerHeight,
    };
  }, [trackRef]);

  const writeProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { top, height } = geometryRef.current;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const p = height > 0 ? Math.min(1, Math.max(0, (scrollTop - top) / height)) : 0;
    el.style.setProperty('--p', p.toFixed(4));
    rafRef.current = null;
  }, [trackRef]);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(writeProgress);
  }, [writeProgress]);

  useEffect(() => {
    updateGeometry();
    // Initial write
    writeProgress();

    const resizeObserver = new ResizeObserver(updateGeometry);
    if (trackRef.current) resizeObserver.observe(trackRef.current);
    resizeObserver.observe(document.body);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, updateGeometry, writeProgress, trackRef]);
}
