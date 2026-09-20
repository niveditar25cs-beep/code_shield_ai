/**
 * SafetyNotice.jsx
 * Prominent security alert notice for user action guidance.
 */

import { escapeText } from '../utils/escape';

export default function SafetyNotice({ status, packageName }) {
  const pkg = escapeText(packageName || 'package');

  if (status === 'VERIFIED') {
    return (
      <div className="safety-notice safety-notice--verified" role="alert">
        <div className="safety-notice__icon">✓</div>
        <div className="safety-notice__content">
          <strong className="safety-notice__title">Registry Verification Confirmed</strong>
          <p className="safety-notice__text">
            <code>pip install {pkg}</code> is safe to run. Package exists on PyPI with authentic release history.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REVIEW_REQUIRED') {
    return (
      <div className="safety-notice safety-notice--warning" role="alert">
        <div className="safety-notice__icon">⚠️</div>
        <div className="safety-notice__content">
          <strong className="safety-notice__title">Warning: Potential Typosquatting / Slopsquatting Detected!</strong>
          <p className="safety-notice__text">
            DO NOT run <code>pip install {pkg}</code> blindly. Verify if an AI hallucinated this package name or misspelled a popular package.
          </p>
        </div>
      </div>
    );
  }

  // NOT_FOUND
  return (
    <div className="safety-notice safety-notice--danger" role="alert">
      <div className="safety-notice__icon">⛔</div>
      <div className="safety-notice__content">
        <strong className="safety-notice__title">Critical Warning: Package Not Found on PyPI</strong>
        <p className="safety-notice__text">
          DO NOT run <code>pip install {pkg}</code>! This package does not exist on PyPI. Running this command risks installing a malicious package if someone registers it (Slopsquatting).
        </p>
      </div>
    </div>
  );
}
