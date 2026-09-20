/**
 * About.jsx
 * What is Slopsquatting & AI Dependency Verification background section.
 */

import TextRoll from './TextRoll';
import InView from './InView';
import { Section, Container } from './Layout';

export default function About() {
  return (
    <Section id="about" aria-labelledby="about-title">
      <Container>
        <InView>
          <div className="about-card">
            <div className="about-content">
              <span className="badge badge--primary">Threat Intel</span>
              <h2 id="about-title" className="about-title display-font mt-3">
                <TextRoll text="What is Slopsquatting?" as="span" />
              </h2>
              <p className="about-text mt-4">
                As developers increasingly rely on AI coding assistants (ChatGPT, Claude, Cursor, Copilot), LLMs frequently suggest Python packages that <strong>do not exist</strong> — either due to hallucinations, outdated training data, or minor typos.
              </p>
              <p className="about-text mt-3">
                Attacker groups monitor AI outputs and register these non-existent package names on PyPI loaded with malicious payloads (RCE, credential stealers, telemetry exfiltration). When developers run <code>pip install</code> without checking, their machines and CI/CD pipelines get compromised.
              </p>
              <div className="about-highlights mt-6">
                <div className="highlight-item">
                  <span className="highlight-icon">🤖</span>
                  <div>
                    <strong>AI Hallucination Vector</strong>
                    <p>AI models generate plausible-sounding package names that developers trust blindly.</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🛡️</span>
                  <div>
                    <strong>Zero-Trust Pre-Install Guard</strong>
                    <p>CodeShield AI checks PyPI registry presence and string distance before execution.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InView>
      </Container>
    </Section>
  );
}
