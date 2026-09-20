/**
 * escape.js
 * Safe text escaping — all user/registry-derived text must go through this.
 * We never use dangerouslySetInnerHTML; this is a belt-and-suspenders guard.
 */

/**
 * Escape a string for safe display. React already escapes JSX text nodes,
 * but this is useful for attribute values or string comparisons.
 */
export function escapeText(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Truncate a string to maxLen characters, appending ellipsis if truncated.
 */
export function truncate(str, maxLen = 80) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}
