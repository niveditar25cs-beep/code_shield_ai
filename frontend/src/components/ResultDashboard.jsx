/**
 * ResultDashboard.jsx
 * Results dashboard combining status banner, safety notice, evidence, explanation, suggestions, and next steps.
 */

import StatusBanner from './StatusBanner';
import SafetyNotice from './SafetyNotice';
import EvidenceList from './EvidenceList';
import ExplanationCard from './ExplanationCard';
import SuggestionsList from './SuggestionsList';
import NextStepCard from './NextStepCard';

export default function ResultDashboard({ result, onSelectPackage, onReset }) {
  if (!result) return null;

  const topSuggestion = result.suggestions && result.suggestions.length > 0 ? result.suggestions[0] : null;

  return (
    <div className="result-dashboard" id="result-dashboard">
      <div className="result-dashboard__header">
        <StatusBanner result={result} />
        {onReset && (
          <button type="button" className="btn btn--outline reset-btn" onClick={onReset}>
            ← Analyze Another Package
          </button>
        )}
      </div>

      <SafetyNotice status={result.status} packageName={result.package_name || result.input_name} />

      <div className="result-dashboard__grid">
        <div className="grid-column">
          <EvidenceList evidence={result.evidence} />
          <ExplanationCard explanation={result.explanation} details={result.details} />
        </div>

        <div className="grid-column">
          <NextStepCard 
            nextStep={result.next_step} 
            packageName={result.package_name || result.input_name} 
            status={result.status}
            topSuggestion={topSuggestion}
          />
          <SuggestionsList suggestions={result.suggestions} onSelectPackage={onSelectPackage} />
        </div>
      </div>
    </div>
  );
}
