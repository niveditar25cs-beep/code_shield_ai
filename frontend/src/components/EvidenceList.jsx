/**
 * EvidenceList.jsx
 * Displays structured evidence items from PyPI registry verification.
 */

import { escapeText } from '../utils/escape';

export default function EvidenceList({ evidence }) {
  if (!evidence) return null;

  const items = [
    {
      label: 'PyPI Registry Status',
      value: evidence.exists ? 'Exists on PyPI' : 'Not found on PyPI',
      status: evidence.exists ? 'pass' : 'fail'
    },
    {
      label: 'Latest Release',
      value: evidence.latest_version ? `v${evidence.latest_version}` : 'N/A',
      status: evidence.latest_version ? 'pass' : 'neutral'
    },
    {
      label: 'Total Releases',
      value: typeof evidence.releases_count === 'number' ? evidence.releases_count : 'N/A',
      status: evidence.releases_count > 0 ? 'pass' : 'neutral'
    },
    {
      label: 'First Release Date',
      value: evidence.first_release_date || 'N/A',
      status: evidence.first_release_date ? 'pass' : 'neutral'
    },
    {
      label: 'Author / Maintainer',
      value: evidence.author ? escapeText(evidence.author) : 'Not specified',
      status: 'neutral'
    },
    {
      label: 'Project URL',
      value: evidence.pypi_url ? (
        <a href={evidence.pypi_url} target="_blank" rel="noopener noreferrer" className="evidence-link">
          PyPI Project Page ↗
        </a>
      ) : 'N/A',
      status: 'neutral'
    }
  ];

  return (
    <div className="evidence-card">
      <h4 className="card-title">
        <span className="card-title-icon">🔍</span> Registry Evidence
      </h4>
      <div className="evidence-grid">
        {items.map((item, idx) => (
          <div key={idx} className={`evidence-item evidence-item--${item.status}`}>
            <span className="evidence-label">{item.label}</span>
            <span className="evidence-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
