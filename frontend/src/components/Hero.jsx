/**
 * Hero.jsx
 */
import TextRoll from './TextRoll';
import InView from './InView';
import { Container } from './Layout';
import { Shield } from 'lucide-react';
import heroBg from '../assets/hero.png';

export default function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-h1">
      {/* Background accent overlay, keeping SiteBackground continuous */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${heroBg})` }}
        role="presentation"
        aria-hidden="true"
      />
      <div className="hero-bg-overlay" aria-hidden="true" />

      <Container className="hero-content">
        <InView variant="fadeDown" transition={{ duration: 600, delay: 100 }}>
          <div className="hero-badge" aria-label="AI-Powered Security Tool">
            <span className="hero-badge-dot" aria-hidden="true" />
            AI-Powered Security Tool
          </div>
        </InView>

        {/* TextRoll on h1 only */}
        <h1 id="hero-h1" className="hero-h1 mt-3">
          <TextRoll text="CodeShield" as="span" />
          <TextRoll text="AI" as="span" className="accent" />
        </h1>

        <InView variant="fadeUp" transition={{ duration: 600, delay: 300 }}>
          <p className="hero-sub mt-4 max-w-2xl mx-auto">
            Verify Python packages suggested by AI assistants before you install them.
            Detect slopsquatting, hallucinated names, and suspicious registry signals.
          </p>
        </InView>

        <InView variant="fadeUp" transition={{ duration: 600, delay: 450 }}>
          <div className="hero-actions mt-10 md:mt-14">
            <a href="#analyzer" className="btn btn-primary">
              <Shield size={18} aria-hidden="true" />
              Analyze a Package
            </a>
            <a href="#how-it-works" className="btn btn-ghost">
              How It Works
            </a>
          </div>
        </InView>
      </Container>
    </section>
  );
}
