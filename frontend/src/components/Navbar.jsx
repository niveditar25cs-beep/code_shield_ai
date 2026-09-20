/**
 * Navbar.jsx
 */
import { useState, useEffect } from 'react';

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header role="banner">
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        <div className="container navbar-inner">
          <a href="#hero" className="navbar-logo" aria-label="CodeShield AI home">
            <ShieldIcon />
            CodeShield AI
          </a>

          <div className="navbar-links" role="list">
            <a href="#analyzer" className="navbar-link" role="listitem">Analyzer</a>
            <a href="#how-it-works" className="navbar-link" role="listitem">How It Works</a>
            <a href="#about" className="navbar-link" role="listitem">About</a>
            <a href="#analyzer" className="navbar-cta" role="listitem">Try Now</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
