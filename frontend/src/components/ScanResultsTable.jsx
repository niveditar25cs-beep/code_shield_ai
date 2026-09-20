/**
 * ScanResultsTable.jsx
 * Results table for batch code scanning. Shows extracted third-party imports and their security status.
 */

import { getStatusMeta } from '../utils/statusMeta';
import { escapeText } from '../utils/escape';

export default function ScanResultsTable({ scanData, onSelectResult }) {
  if (!scanData || !scanData.results) return null;

  const { summary, results } = scanData;

  if (results.length === 0) {
    return (
      <div className="empty-scan-notice">
        <p>No third-party import statements were detected in the provided code.</p>
      </div>
    );
  }

  return (
    <div className="scan-results-container">
      <div className="scan-summary-cards">
        <div className="summary-card">
          <span className="summary-value">{summary.total || results.length}</span>
          <span className="summary-label">Scanned Imports</span>
        </div>
        <div className="summary-card summary-card--verified">
          <span className="summary-value">{summary.verified || 0}</span>
          <span className="summary-label">Verified (Safe)</span>
        </div>
        <div className="summary-card summary-card--warning">
          <span className="summary-value">{summary.review_required || 0}</span>
          <span className="summary-label">Review Required</span>
        </div>
        <div className="summary-card summary-card--alert">
          <span className="summary-value">{summary.not_found || 0}</span>
          <span className="summary-label">Not Found / Threat</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="scan-table">
          <thead>
            <tr>
              <th>Import / Package Name</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Key Evidence / Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, idx) => {
              const status = item.status || 'NOT_FOUND';
              const meta = getStatusMeta(status);
              const pkgName = escapeText(item.package_name || item.import_name || 'unknown');
              const importName = escapeText(item.import_name || pkgName);

              return (
                <tr key={idx} className={`table-row table-row--${status.toLowerCase()}`}>
                  <td className="cell-package">
                    <code>{importName}</code>
                    {pkgName !== importName && (
                      <span className="sub-pkg-name"> (pkg: <code>{pkgName}</code>)</span>
                    )}
                  </td>
                  <td className="cell-status">
                    <span 
                      className="status-pill" 
                      style={{ backgroundColor: meta.badgeBg, color: meta.badgeColor }}
                    >
                      <span aria-hidden="true">{meta.icon}</span> {meta.label}
                    </span>
                  </td>
                  <td className="cell-confidence">
                    {typeof item.confidence_score === 'number' ? item.confidence_score : 0}%
                  </td>
                  <td className="cell-evidence">
                    <span className="evidence-summary">
                      {status === 'VERIFIED' && 'Verified on PyPI registry'}
                      {status === 'REVIEW_REQUIRED' && (item.explanation || 'Potential typosquat match')}
                      {status === 'NOT_FOUND' && 'Package does NOT exist on PyPI!'}
                      {status === 'REGISTRY_UNAVAILABLE' && 'PyPI temporary connectivity issue'}
                    </span>
                  </td>
                  <td className="cell-action">
                    <button 
                      type="button" 
                      className="btn btn--sm btn--outline"
                      onClick={() => onSelectResult(item)}
                    >
                      Open Full Analysis
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
