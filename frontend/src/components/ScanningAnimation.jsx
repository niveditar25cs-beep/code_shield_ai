/**
 * ScanningAnimation.jsx
 * 4-stage animated scanning experience before showing results dashboard.
 */

import { useState, useEffect } from 'react';
import TextShimmerWave from './TextShimmerWave';

const SCAN_STAGES = [
  { id: 1, label: 'Normalizing package name & checking PEP 503 rules...' },
  { id: 2, label: 'Querying PyPI registry evidence & version release history...' },
  { id: 3, label: 'Analyzing name similarity & typosquatting / slopsquatting vectors...' },
  { id: 4, label: 'Synthesizing security score & generating safety guidance...' }
];

export default function ScanningAnimation({ packageName, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    let timer;
    const advanceStage = (stage) => {
      if (stage < SCAN_STAGES.length) {
        setCurrentStage(stage);
        timer = setTimeout(() => advanceStage(stage + 1), 600);
      } else {
        if (onComplete) onComplete();
      }
    };

    advanceStage(0);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="scanning-container" aria-live="polite" aria-busy="true">
      <div className="scanning-shield">
        <div className="shield-ring shield-ring--outer"></div>
        <div className="shield-ring shield-ring--inner"></div>
        <div className="shield-core">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
            <path d="M12 7v10M8 11l4 4 4-4" />
          </svg>
        </div>
      </div>

      <div className="scanning-header">
        <h3 className="scanning-title">
          Scanning <code className="scanning-target">{packageName}</code>
        </h3>
        <TextShimmerWave text="Analyzing AI package recommendations..." />
      </div>

      <div className="scanning-stages">
        {SCAN_STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isActive = idx === currentStage;
          const isPending = idx > currentStage;

          return (
            <div 
              key={stage.id} 
              className={`stage-item ${isDone ? 'stage-item--done' : ''} ${isActive ? 'stage-item--active' : ''} ${isPending ? 'stage-item--pending' : ''}`}
            >
              <div className="stage-icon">
                {isDone && '✓'}
                {isActive && <span className="spinner-dot"></span>}
                {isPending && '○'}
              </div>
              <span className="stage-text">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
