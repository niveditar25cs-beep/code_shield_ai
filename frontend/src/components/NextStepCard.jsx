/**
 * NextStepCard.jsx
 * Recommended action card with one-click copyable pip install command.
 */

import { useState } from 'react';
import { escapeText } from '../utils/escape';

export default function NextStepCard({ nextStep, packageName, status, topSuggestion }) {
  const [copied, setCopied] = useState(false);

  // Determine copyable install target
  const installTarget = status === 'VERIFIED' 
    ? packageName 
    : (topSuggestion ? (typeof topSuggestion === 'string' ? topSuggestion : topSuggestion.name) : null);

  const command = installTarget ? `pip install ${installTarget}` : null;

  const handleCopy = () => {
    if (!command) return;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="next-step-card">
      <h4 className="card-title">
        <span className="card-title-icon">🎯</span> Recommended Next Step
      </h4>
      
      <p className="next-step-text">
        {escapeText(nextStep || (status === 'VERIFIED' ? 'Safe to proceed with installation.' : 'Use extreme caution or switch to an official package.'))}
      </p>

      {command && (
        <div className="command-box">
          <code className="command-text">$ {command}</code>
          <button 
            type="button" 
            className="btn btn--copy" 
            onClick={handleCopy}
            aria-label="Copy install command"
          >
            {copied ? 'Copied ✓' : 'Copy Command'}
          </button>
        </div>
      )}
    </div>
  );
}
