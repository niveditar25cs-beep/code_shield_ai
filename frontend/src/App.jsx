/**
 * App.jsx
 * CodeShield AI Main Application Layout
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollShowcase from './components/ScrollShowcase';
import Analyzer from './components/Analyzer';
import HowItWorks from './components/HowItWorks';
import About from './components/About';
import Footer from './components/Footer';
import SiteBackground from './components/SiteBackground';
import SectionDivider from './components/SectionDivider';

export default function App() {
  return (
    <div className="app-root">
      {/* 1. Continuous site background rendered once behind everything */}
      <SiteBackground />
      <Navbar />
      <main id="main-content">
        <Hero />
        <SectionDivider />
        <ScrollShowcase />
        <SectionDivider />
        <Analyzer />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <About />
      </main>
      <Footer />
    </div>
  );
}

