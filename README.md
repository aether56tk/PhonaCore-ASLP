# PhonaCore-ASLP

**Browser-based acoustic voice analysis, clinical assessment and research software platform for Audiology & Speech-Language Pathology.**

## Live application

**GitHub Pages:** https://aether56tk.github.io/PhonaCore-ASLP/

## Platform

PhonaCore-ASLP is a browser-based software interface designed for voice assessment, acoustic analysis, clinical workflow management, reporting, tele-assessment, research workflows, and data organization.

## UI / UX modules

- Dashboard
- Patient management
- Clinical assessment
- Voice Lab
- Recording and task workflow
- Acoustic measurement dashboard
- Clinical reports
- Tele-assessment
- Research Lab
- Study Protocol
- Batch Research
- Validation Lab
- Reliability Lab
- Validity Lab
- Algorithm Validation
- Study Manager
- Dataset management
- Statistics
- Security and privacy controls
- Settings

## Software features

- Browser microphone recording
- Real-time input-level monitoring
- Voice-task selection and guided recording
- Acoustic measurement display
- Signal-quality indicators
- Interactive data tables
- Research dataset import/export
- CSV and JSON workflows
- Recording metadata
- Session management
- Clinical documentation
- Report generation and printing
- Data visualization
- Validation and statistical analysis interfaces
- Dataset integrity and hashing tools
- Standardized study workflow tools
- Local/browser-oriented processing

## Voice analysis interface

The Voice Lab provides structured workflows for:

- Sustained vowel
- Reading
- Counting
- Conversation
- Maximum phonation time
- Pitch range
- Loudness / intensity

The interface presents acoustic measurements, recording quality information, task information, session data, and analysis results in a unified workflow.

## Research software

The research section provides software tools for:

- Standardized recording protocols
- Batch WAV analysis
- Dataset organization
- Reference-system comparison
- Agreement analysis
- Reliability analysis
- Criterion-validity analysis
- Algorithm validation
- Study QA
- Reproducibility metadata
- Exportable research reports

## Local development

Requires Node.js 20 or later.

```bash
npm install
npm test
npm start
```

Open:

`http://localhost:5173`

Run the software verification commands:

```bash
npm run check
npm run synthetic:benchmark
npm run ci
```

## Privacy

PhonaCore-ASLP is designed with browser/local processing workflows where applicable.

Do not place personal identifiers, patient records, consent documents, clinical recordings, or other sensitive information in the public GitHub repository or GitHub Pages deployment.

Use appropriate secure storage and institutional procedures for real patient or research data.

## Project structure

```text
PhonaCore-ASLP/
├── public/              # Browser application, UI and client-side workflows
├── src/                 # Analysis and research software modules
├── tests/               # Automated software tests
├── server.js            # Local development server
├── package.json         # Project configuration
└── .github/workflows/   # Automated verification
```

## Status

**Software platform:** implemented

**UI/UX workflow:** implemented

**Automated software testing:** enabled

**Research and validation tools:** implemented as software workflows

**Human-data studies:** separate from the software deployment

## Important

PhonaCore-ASLP is software for Audiology and Speech-Language Pathology workflows. Acoustic results and other outputs should be interpreted by appropriately trained users within the intended workflow and study context.
