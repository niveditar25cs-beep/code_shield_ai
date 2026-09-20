# CodeShield AI — AI Dependency Verification & Slopsquatting Protection

![CodeShield AI Banner](frontend/src/assets/hero.png)

**CodeShield AI** is an intelligent security verification engine designed to protect software supply chains from **AI package hallucinations**, **slopsquatting**, and **typosquatting** in Python dependencies suggested by Generative AI assistants (Copilot, ChatGPT, Claude, Gemini, etc.).

---

## 🌟 Key Features

- 🔍 **Real-Time Package Verifier**: Input any Python package name suggested by AI assistants to verify its PyPI registry presence, version releases, and maintainer details before running `pip install`.
- 📄 **AST Code Import Scanner**: Paste Python code snippets to parse Abstract Syntax Trees (`ast`), extract all third-party `import` and `from ... import` statements, and analyze them in a single pass.
- 🎯 **Slopsquatting & Typosquatting Detection Engine**: Uses Levenshtein and Damerau-Levenshtein edit-distance algorithms to compare non-existent or suspicious package names against a curated database of 1,000+ popular PyPI libraries.
- 🛡️ **Actionable Security Classifications**:
  - 🟢 **VERIFIED**: Legitimate, active package on PyPI with established history.
  - 🟡 **REVIEW REQUIRED**: Package exists on PyPI but exhibits typosquatting signals, recent creation dates, or low download activity.
  - 🔴 **NOT FOUND**: Hallucinated package name that does not exist on PyPI — high risk of slopsquatting malware injection.
- 🎨 **Modern Cyber-Security Design**: Dark mode UI with interactive 4-layer HTML5 Canvas matrix code-rain background, drifting 3D wireframe glass cubes, and glassmorphic UI components.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite 8, Lucide React, Framer Motion, Vanilla CSS Design System with 8px grid alignment.
- **Backend API**: Python 3.10+, Flask 3.0, Flask-CORS, `requests`, `python-dotenv`.
- **Analysis Engine**: Python `ast` module, PEP 508 / PEP 503 name normalizers, Levenshtein edit-distance engines.
- **Deployment**: Vercel Serverless Functions (`api/index.py`) + Static SPA asset hosting.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/niveditar25cs-beep/code_shield_ai.git
   cd code_shield_ai
   ```

2. **Frontend Setup & Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs locally on `http://localhost:5173`.

3. **Backend Setup & Development**:
   ```bash
   cd ../backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   python app.py
   ```
   The Flask API runs locally on `http://localhost:5000`.

---

## 📊 End-to-End Workflow

```
[ User Input: Package / Code ] ──► [ React 19 UI Validation ] ──► [ Flask API Router ]
                                                                       │
┌──────────────────────────────────────────────────────────────────────┘
▼
[ AST Import Parser ] ──► [ PEP 508 Normalizer ] ──► [ PyPI Live Registry Verification ]
                                                               │
┌──────────────────────────────────────────────────────────────┘
▼
[ Levenshtein Distance Matrix Engine ] ──► [ Evidence & Risk Synthesizer ] ──► [ Interactive Dashboard ]
```

---

## 🚀 Deployment on Vercel

This repository is pre-configured for **Vercel** with a combined `vercel.json` routing configuration:

1. Import `niveditar25cs-beep/code_shield_ai` into **[Vercel](https://vercel.com/new)**.
2. Select **Vite** as Framework Preset.
3. Deploy!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
