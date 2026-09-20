/**
 * ExplanationCard.jsx
 * Detailed analysis breakdown and AI explanation card.
 */

import { escapeText } from '../utils/escape';

export default function ExplanationCard({ explanation, details }) {
  if (!explanation && (!details || details.length === 0)) return null;

  return (
    <div className="explanation-card">
      <h4 className="card-title">
        <span className="card-title-icon">💡</span> Risk Analysis & Reasoning
      </h4>
      
      {explanation && (
        <div className="explanation-body">
          <p>{escapeText(explanation)}</p>
        </div>
      )}

      {details && details.length > 0 && (
        <div className="explanation-details">
          <h5 className="details-heading">Specific Findings:</h5>
          <ul className="details-list">
            {details.map((detail, idx) => (
              <li key={idx} className="details-item">
                <span className="bullet-dot" aria-hidden="true">•</span>
                <span>{escapeText(detail)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
