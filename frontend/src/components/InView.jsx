/**
 * InView.jsx
 * IntersectionObserver-based reveal component.
 * Uses shared observer pool, data-inview attributes, no setState per tick.
 * Never nested. Content never display:none.
 */

import { useEffect, useRef } from 'react';

// Shared observer pool keyed by stringified options
const observerPool = new Map();

function getObserver(options) {
  const key = JSON.stringify(options);
  if (observerPool.has(key)) return observerPool.get(key);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      const once = el.dataset.inviewOnce !== 'false';

      if (entry.isIntersecting) {
        el.dataset.inviewState = 'visible';
        if (once) {
          // After transition, set to done
          const onTransitionEnd = () => {
            el.dataset.inviewState = 'done';
            el.removeEventListener('transitionend', onTransitionEnd);
          };
          el.addEventListener('transitionend', onTransitionEnd, { once: true });
          obs.unobserve(el);
        }
      } else if (!once) {
        el.dataset.inviewState = 'hidden';
      }
    });
  }, options);

  observerPool.set(key, obs);
  return obs;
}

/**
 * @param {object} props
 * @param {string} [props.as='div'] - element type
 * @param {string} [props.variant='fadeUp'] - fade|fadeUp|fadeDown|fadeLeft|fadeRight|slideUp|scaleIn
 * @param {object} [props.transition] - {duration, delay, ease}
 * @param {object} [props.viewOptions] - {once, margin, amount}
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function InView({
  as: Tag = 'div',
  variant = 'fadeUp',
  transition = {},
  viewOptions = {},
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null);

  const {
    duration = 500,
    delay = 0,
    ease = 'cubic-bezier(0.4,0,0.2,1)',
  } = transition;

  const {
    once = true,
    margin = '0px 0px -60px 0px',
    amount = 0.15,
  } = viewOptions;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set CSS vars for transition timing
    el.style.setProperty('--inview-duration', `${duration}ms`);
    el.style.setProperty('--inview-delay', `${delay}ms`);
    el.style.setProperty('--inview-ease', ease);

    // Initial hidden state
    el.dataset.inviewState = 'hidden';
    el.dataset.inviewOnce = String(once);

    // Reveal on keyboard focus
    const onFocus = () => {
      el.dataset.inviewState = 'visible';
    };
    el.addEventListener('focusin', onFocus);

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.dataset.inviewState = 'done';
      return () => el.removeEventListener('focusin', onFocus);
    }

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      el.dataset.inviewState = 'done';
      return () => el.removeEventListener('focusin', onFocus);
    }

    const obs = getObserver({
      rootMargin: margin,
      threshold: amount,
    });
    obs.observe(el);

    return () => {
      obs.unobserve(el);
      el.removeEventListener('focusin', onFocus);
    };
  }, [duration, delay, ease, once, margin, amount]);

  return (
    <Tag
      ref={ref}
      data-inview={variant}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Helper: stagger delay for list items.
 * @param {number} i - index
 * @param {number} [base=100] - base delay ms
 * @param {number} [step=80] - ms per item
 */
export function staggerDelay(i, base = 100, step = 80) {
  return { delay: base + i * step };
}
