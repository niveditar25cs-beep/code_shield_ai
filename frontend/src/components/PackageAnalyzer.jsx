/**
 * PackageAnalyzer.jsx
 * Package analysis tab with search input group, sample chips (no labels/badges), scanning animation, and dashboard display.
 */

import { useState } from 'react';
import { useAnalyze } from '../hooks/useAnalyze';
import { validatePackageName } from '../utils/validate';
import ScanningAnimation from './ScanningAnimation';
import ResultDashboard from './ResultDashboard';

const SAMPLE_PACKAGES = [
  'requests',
  'reqeusts',
  'python-crypto-lib-ai',
  'flask',
  'langchain-core'
];

export default function PackageAnalyzer() {
  const [inputVal, setInputVal] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activePackage, setActivePackage] = useState('');

  const { state, analyzePackage, reset } = useAnalyze();

  const handleAnalyze = (pkgToAnalyze) => {
    const target = (pkgToAnalyze !== undefined ? pkgToAnalyze : inputVal).trim();
    const validation = validatePackageName(target);

    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError('');
    setActivePackage(target);
    setIsScanning(true);

    // Trigger analysis
    analyzePackage(target);
  };

  const handleScanAnimationComplete = () => {
    setIsScanning(false);
  };

  const handleReset = () => {
    setInputVal('');
    setValidationError('');
    setIsScanning(false);
    setActivePackage('');
    reset();
  };

  return (
    <div className="package-analyzer">
      {!state.data && !isScanning && (
        <div className="analyzer-search-card">
          <p className="search-card-subtitle">
            Type a Python package name suggested by AI assistants to verify its PyPI registry presence and slopsquatting risk.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="search-form"
          >
            <div className="input-group-container">
              <div className="input-group-box">
                <span className="input-prefix mono">pip install</span>
                <input
                  type="text"
                  className={`search-input mono ${validationError ? 'search-input--error' : ''}`}
                  placeholder="package-name"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  disabled={state.status === 'loading'}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  aria-label="Python package name"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary search-btn"
                disabled={!inputVal.trim() || state.status === 'loading'}
              >
                Analyze Package
              </button>
            </div>

            {validationError && (
              <p className="error-message" role="alert">{validationError}</p>
            )}
          </form>

          <div className="sample-chips-section">
            <span className="sample-chips-label">Try sample packages:</span>
            <div className="sample-chips-flex">
              {SAMPLE_PACKAGES.map((pkgName) => (
                <button
                  key={pkgName}
                  type="button"
                  className="sample-chip-pill mono"
                  onClick={() => {
                    setInputVal(pkgName);
                    handleAnalyze(pkgName);
                  }}
                >
                  <code>{pkgName}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <ScanningAnimation 
          packageName={activePackage} 
          onComplete={handleScanAnimationComplete} 
        />
      )}

      {!isScanning && state.status === 'error' && (
        <div className="error-card" role="alert">
          <h4 className="error-card__title">Analysis Failed</h4>
          <p className="error-card__text">{state.error}</p>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            Try Again
          </button>
        </div>
      )}

      {!isScanning && state.status === 'success' && state.data && (
        <ResultDashboard 
          result={state.data} 
          onSelectPackage={(pkgName) => {
            setInputVal(pkgName);
            handleAnalyze(pkgName);
          }}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
