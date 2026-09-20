/**
 * HowItWorks.jsx
 * Explains Slopsquatting defense and CodeShield AI verification pipeline.
 */

import TextRoll from './TextRoll';
import InView from './InView';
import { Section, Container, SectionHeader } from './Layout';

const STEPS = [
  {
    num: '01',
    title: 'PEP 503 Normalization',
    desc: 'Normalizes package names per PyPI rules (lowercase, replace dots and underscores with hyphens) to detect deceptive naming variations.'
  },
  {
    num: '02',
    title: 'PyPI Registry Lookup',
    desc: 'Queries the official PyPI JSON API with 300s TTL caching to verify release history, creation dates, maintainers, and existence.'
  },
  {
    num: '03',
    title: 'Slopsquatting & Typosquat Analysis',
    desc: 'Compares input against 150+ popular Python packages using string distance metrics (difflib) to flag suspicious close matches.'
  },
  {
    num: '04',
    title: 'Actionable Safety Synthesis',
    desc: 'Generates confidence scores, clear risk warnings, recommended next steps, and safe copyable pip install commands.'
  }
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works" aria-labelledby="hiw-title">
      <Container>
        <InView>
          <SectionHeader
            eyebrow={<span className="badge badge--primary">Architecture Pipeline</span>}
            title={<TextRoll text="How CodeShield AI Defends Your Pipeline" as="span" />}
            titleId="hiw-title"
            subtitle="Multi-layered defense against LLM package hallucination and malicious typosquatting."
          />
        </InView>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <InView key={step.num}>
              <div className="step-card">
                <span className="step-number display-font">{step.num}</span>
                <h3 className="step-title display-font">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </InView>
          ))}
        </div>
      </Container>
    </Section>
  );
}
