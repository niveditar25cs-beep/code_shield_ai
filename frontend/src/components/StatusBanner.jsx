/**
 * StatusBanner.jsx
 * Visual header banner for package analysis results.
 */

import { getStatusMeta } from '../utils/statusMeta';
import { escapeText } from '../utils/escape';

export default function StatusBanner({ result }) {
  if (!result) return null;

  const status = result.status || 'NOT_FOUND';
  const meta = getStatusMeta(status);
  const pkgName = escapeText(result.package_name || result.input_name || 'Unknown');
  const normalizedName = escapeText(result.normalized_name || '');
  const confidence = typeof result.confidence_score === 'number' ? result.confidence_score : 0;

  return (
    <div className={`status-banner status-banner--${status.toLowerCase()}`}>
      <div className="status-banner__top">
        <div className="status-banner__badge" style={{ backgroundColor: meta.badgeBg, color: meta.badgeColor }}>
          <span className="status-banner__icon" aria-hidden="true">{meta.icon}</span>
          <span className="status-banner__label">{meta.label}</span>
        </div>
        <div className="status-banner__confidence">
          <span className="confidence-label">Confidence Score</span>
          <div className="confidence-bar-bg" title={`Confidence: ${confidence}%`}>
            <div 
              className="confidence-bar-fill" 
              style={{ width: `${Math.min(100, Math.max(0, confidence))}%`, backgroundColor: meta.badgeBg }}
            />
          </div>
          <span className="confidence-value">{confidence}%</span>
        </div>
      </div>

      <div className="status-banner__body">
        <h3 className="status-banner__title">
          Package: <code className="pkg-code">{pkgName}</code>
          {normalizedName && normalizedName !== pkgName && (
            <span className="status-banner__normalized"> (Normalized: <code>{normalizedName}</code>)</span>
          )}
        </h3>
        <p className="status-banner__headline">{escapeText(meta.headline)}</p>
      </div>
    </div>
  );
}
