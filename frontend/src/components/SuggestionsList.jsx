/**
 * SuggestionsList.jsx
 * Displays similar package suggestions and allows clicking to analyze them.
 */

import { escapeText } from '../utils/escape';

export default function SuggestionsList({ suggestions, onSelectPackage }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestions-card">
      <h4 className="card-title">
        <span className="card-title-icon">🔄</span> Similar / Genuine Package Suggestions
      </h4>
      <p className="suggestions-subtitle">
        If an AI assistant suggested this package, it may have intended one of these official packages:
      </p>
      
      <div className="suggestions-list">
        {suggestions.map((item, idx) => {
          const pkgName = typeof item === 'string' ? item : item.name;
          const score = typeof item === 'object' && item.score ? item.score : null;
          const safePkgName = escapeText(pkgName);

          return (
            <div key={idx} className="suggestion-item">
              <div className="suggestion-info">
                <code className="suggestion-name">{safePkgName}</code>
                {score && <span className="suggestion-score">({Math.round(score * 100)}% match)</span>}
              </div>
              <div className="suggestion-actions">
                {onSelectPackage && (
                  <button 
                    type="button" 
                    className="btn btn--sm btn--secondary"
                    onClick={() => onSelectPackage(pkgName)}
                  >
                    Analyze {safePkgName}
                  </button>
                )}
                <a 
                  href={`https://pypi.org/project/${encodeURIComponent(pkgName)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="suggestion-link"
                >
                  View PyPI ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
