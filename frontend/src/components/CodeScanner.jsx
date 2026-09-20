/**
 * CodeScanner.jsx
 * Code snippet scanner tab. Uses ast extraction endpoint /api/scan-code.
 */

import { useState } from 'react';
import { useScanCode } from '../hooks/useAnalyze';
import ScanResultsTable from './ScanResultsTable';
import ResultDashboard from './ResultDashboard';
import TextShimmerWave from './TextShimmerWave';

const SAMPLE_CODE = `import os
import sys
import requests
import reqeusts
import python_crypto_lib_ai
from flask import Flask, jsonify

app = Flask(__name__)
`;

export default function CodeScanner() {
  const [code, setCode] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const { state, scanCode, reset } = useScanCode();

  const handleScan = () => {
    if (!code.trim()) return;
    setSelectedResult(null);
    scanCode(code);
  };

  const handleLoadSample = () => {
    setCode(SAMPLE_CODE);
    setSelectedResult(null);
  };

  const handleReset = () => {
    setCode('');
    setSelectedResult(null);
    reset();
  };

  return (
    <div className="code-scanner">
      {!selectedResult && (
        <div className="code-scanner__input-section">
          <div className="input-header">
            <div>
              <h3 className="scanner-title">Scan Python Source Code</h3>
              <p className="scanner-subtitle">
                Paste Python code suggested by AI to extract imports and analyze third-party packages in one pass.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn--secondary btn--sm"
              onClick={handleLoadSample}
            >
              Load Sample Code
            </button>
          </div>

          <textarea
            className="code-textarea"
            rows="10"
            placeholder={`# Paste Python code here, e.g.:\nimport requests\nimport reqeusts\nimport langchain_core`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={state.status === 'loading'}
            spellCheck="false"
          />

          <div className="scanner-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleScan}
              disabled={!code.trim() || state.status === 'loading'}
            >
              {state.status === 'loading' ? 'Extracting & Scanning Imports...' : 'Scan Code for Dependencies'}
            </button>
            {code && (
              <button 
                type="button" 
                className="btn btn--text" 
                onClick={handleReset}
                disabled={state.status === 'loading'}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="scanning-container">
          <div className="scanning-header">
            <h3 className="scanning-title">Parsing AST & Analyzing Imports</h3>
            <TextShimmerWave text="Checking dependencies against PyPI registry & slopsquatting database..." />
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="error-card" role="alert">
          <h4 className="error-card__title">Code Scan Failed</h4>
          <p className="error-card__text">{state.error}</p>
          <button type="button" className="btn btn--secondary" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      )}

      {state.status === 'success' && state.data && !selectedResult && (
        <div className="code-scanner__results">
          <div className="results-header">
            <h4>Code Scan Analysis Results</h4>
            <button type="button" className="btn btn--outline btn--sm" onClick={handleReset}>
              Scan New Code
            </button>
          </div>
          <ScanResultsTable 
            scanData={state.data} 
            onSelectResult={(item) => setSelectedResult(item)} 
          />
        </div>
      )}

      {selectedResult && (
        <div className="selected-result-modal">
          <div className="modal-header">
            <button 
              type="button" 
              className="btn btn--outline btn--sm"
              onClick={() => setSelectedResult(null)}
            >
              ← Back to Code Scan Table
            </button>
            <span className="modal-tag font-mono">
              Package: {selectedResult.package_name || selectedResult.input_name}
            </span>
          </div>
          <ResultDashboard 
            result={selectedResult} 
            onReset={() => setSelectedResult(null)} 
          />
        </div>
      )}
    </div>
  );
}
