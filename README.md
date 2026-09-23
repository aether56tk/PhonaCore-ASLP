# PhonaCore-ASLP

**Browser-based acoustic voice analysis, clinical assessment and research validation platform for Audiology & Speech-Language Pathology.**

## Live application

**GitHub Pages:** https://aether56tk.github.io/PhonaCore-ASLP/

PhonaCore-ASLP provides a browser-based workflow for voice recording, acoustic analysis, clinical documentation, research validation, reliability analysis, criterion/reference comparison, standardized study protocols, dataset QA, and reproducibility reporting.

## Core capabilities

- Browser-based voice acquisition with controlled recording settings
- Signal-quality monitoring and measurement gates
- Acoustic analysis including F0, jitter/period perturbation, shimmer/amplitude perturbation, noise-related measures and CPP prototype
- Voice tasks including sustained vowel, reading, counting, conversation, maximum phonation time, pitch range and intensity
- Clinical assessment and structured reporting workflow
- Vocal-health and hygiene education resources
- Standardized research recording protocol
- Batch WAV analysis with protocol QA and SHA-256 file integrity hashes
- MDVP/reference-system comparison workflow
- Bias, MAE, RMSE, Pearson correlation, CCC and Bland–Altman agreement analysis
- Test–retest and recording-condition reliability analysis
- Controlled synthetic algorithm validation
- Human-study management and final QA workflow
- Reproducibility/publication package export

## Research workflow

```text
Participant
    ↓
Consent and study registration
    ↓
Standardized recording
    ↓
Signal / protocol QA
    ↓
PhonaCore-ASLP analysis
    ↓
Reference-system analysis
    ↓
Paired measurements
    ↓
Agreement / reliability analysis
    ↓
Dataset integrity and reproducibility QA
    ↓
Research results
```

The validation design is based on analyzing the **same standardized recording** with PhonaCore-ASLP and the selected reference implementation wherever reference comparison is performed.

## Local development

Requires Node.js 20 or later.

```bash
npm install
npm test
npm start
```

Then open:

`http://localhost:5173`

For the full verification workflow:

```bash
npm run check
npm run synthetic:benchmark
npm run ci
```

## Data privacy and research data

The application is designed around local/browser-side processing for the research workflow. **Do not publish participant recordings, consent forms, names, contact information, or other identifiable research data in this repository or through GitHub Pages.**

Keep research participant data in the approved secure research storage defined by the study protocol.

## Scientific boundary

PhonaCore-ASLP is a **research/educational software system**. The presence of an algorithm-validation or reference-comparison workflow does not by itself establish clinical validity, diagnostic accuracy, normative reference ranges, regulatory certification, or equivalence to MDVP.

Acoustic measures may depend on the recording protocol, microphone/device, browser processing, signal quality, pitch/period extraction and analysis implementation. Results should therefore be interpreted according to the study protocol and validated against the defined reference implementation.

The synthetic benchmark uses controlled engineering test signals and is not a substitute for human-subject validation.

## Current research aim

The primary research aim is to evaluate how closely acoustic measurements obtained using PhonaCore-ASLP agree with measurements obtained from a defined reference system (including MDVP where applicable) using standardized voice recordings.

A secondary research question concerns the effect of recording/device/browser processing conditions on PhonaCore-ASLP measurements.

## Project status

- Software workflow: **implemented**
- Automated software QA: **passing**
- Standardized research workflow: **implemented**
- Human participant data collection: **study phase**
- Empirical human validation: **pending study data**

Human-study conclusions should be based on the collected dataset, approved study methodology and appropriate statistical analysis.
