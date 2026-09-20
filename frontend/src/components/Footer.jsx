/**
 * Footer.jsx
 */

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
            </svg>
            <span>CodeShield AI</span>
          </div>
          <p className="footer-tagline">
            AI Dependency Verification & Slopsquatting Defense
          </p>
        </div>

        <div className="footer-links">
          <a href="#hero">Back to top ↑</a>
          <a href="#analyzer">Analyzer</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About Threat</a>
        </div>

        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} CodeShield AI. Protecting developers from AI package hallucinations.</p>
        </div>
      </div>
    </footer>
  );
}
