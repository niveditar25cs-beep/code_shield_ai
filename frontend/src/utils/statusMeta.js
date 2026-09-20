/**
 * statusMeta.js
 * Single source of truth for status labels, colors, and icons.
 * Import this wherever you need status presentation data.
 */

export const STATUS_META = {
  VERIFIED: {
    label: 'Verified in registry',
    color: 'var(--color-green)',
    icon: '✓',
    cssClass: 'VERIFIED',
  },
  REVIEW_REQUIRED: {
    label: 'Review Required',
    color: 'var(--color-amber)',
    icon: '⚠',
    cssClass: 'REVIEW_REQUIRED',
  },
  NOT_FOUND: {
    label: 'Not Found',
    color: 'var(--color-red)',
    icon: '✕',
    cssClass: 'NOT_FOUND',
  },
};

/**
 * Get meta for a given status string.
 * Returns a safe fallback if the status is unknown.
 */
export function getStatusMeta(status) {
  return STATUS_META[status] ?? {
    label: status ?? 'Unknown',
    color: 'var(--color-text-muted)',
    icon: '?',
    cssClass: 'UNKNOWN',
  };
}
