/**
 * Analyzer.jsx
 * Main tabbed container for Package Analyzer and Code Scanner features.
 */

import { useState } from 'react';
import TextRoll from './TextRoll';
import PackageAnalyzer from './PackageAnalyzer';
import CodeScanner from './CodeScanner';
import { Section, Container, SectionHeader } from './Layout';
import { Package, FileCode } from 'lucide-react';

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('package'); // 'package' | 'code'

  return (
    <Section id="analyzer" aria-labelledby="analyzer-title">
      <Container>
        <SectionHeader
          eyebrow={<span className="badge badge--primary">Interactive Security Suite</span>}
          title={<TextRoll text="Verify AI-Generated Dependencies" as="span" />}
          titleId="analyzer-title"
          subtitle="Protect your codebase from slopsquatting, typosquatting, and AI package hallucinations."
        />

        <div className="tab-nav-wrapper">
          <div className="tab-nav" role="tablist" aria-label="Analysis Modes">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'package'}
              aria-controls="panel-package"
              id="tab-package"
              className={`tab-btn ${activeTab === 'package' ? 'active' : ''}`}
              onClick={() => setActiveTab('package')}
            >
              <Package size={16} aria-hidden="true" className="tab-icon" />
              Analyze Package
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'code'}
              aria-controls="panel-code"
              id="tab-code"
              className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <FileCode size={16} aria-hidden="true" className="tab-icon" />
              Scan Code Imports
            </button>
          </div>
        </div>

        <div className="tab-content">
          <div
            id="panel-package"
            role="tabpanel"
            aria-labelledby="tab-package"
            hidden={activeTab !== 'package'}
          >
            {activeTab === 'package' && <PackageAnalyzer />}
          </div>

          <div
            id="panel-code"
            role="tabpanel"
            aria-labelledby="tab-code"
            hidden={activeTab !== 'code'}
          >
            {activeTab === 'code' && <CodeScanner />}
          </div>
        </div>
      </Container>
    </Section>
  );
}

