# PhonaCore-ASLP — Voice Measurement Documentation

**Document status:** Pre-data-collection research documentation  
**Project:** PhonaCore-ASLP  
**Reference framework:** MDVP Model 5105 / supplied MDVP Manual and PhonaCore Validation document

## 1. Title
PhonaCore-ASLP Acoustic Voice Analysis, Clinical Screening and MDVP-Oriented Validation Study

## 2. Background
PhonaCore is a browser-based acoustic voice-analysis platform intended to extract objective voice measurements from recorded speech/voice samples. The supplied MDVP validation document describes sustained /a/ acquisition at comfortable pitch and loudness, standardized microphone placement, high-rate sampling, removal of DC offset, selection of a stationary middle segment, pitch-period extraction, and calculation of up to 33 acoustic parameters.

PhonaCore uses this framework as a reference specification, not as evidence that the browser implementation is already equivalent to MDVP.

## 3. Aim
To define and document the acoustic measurements implemented by PhonaCore and establish a reproducible framework for their analytical evaluation and paired validation against MDVP before human-data collection.

## 4. Objectives
1. Define every measured parameter.
2. State the unit and computational basis.
3. State why each parameter is measured.
4. State the intended interpretation.
5. Record the configured/reference threshold supplied by the project documents.
6. Define the interpretation boundary for each parameter.
7. Identify the data source required to establish evidence.
8. Separate software implementation from empirical validation.
9. Prevent unsupported clinical or diagnostic interpretation.
10. Preserve reproducibility across recordings, builds and validation datasets.

## 5. What are we measuring?
The registry covers:
F0/MF0, Fhi, Flo, STD, T0, Jita, Jitt, RAP, PPQ, sPPQ, vF0, ShdB, Shim, APQ, sAPQ, vAm, NHR, VTI, SPI, DVB, DSH, DUV, NUV, NVB, NSH, SEG, PER, PFR, FTRI, ATRI, Fftr, Fatr and Tsam.

## 6. Measurement domains
| Domain | Main question |
|---|---|
| F0 / pitch baseline | What is the fundamental frequency and how stable is it? |
| Frequency perturbation | How much does cycle-to-cycle pitch period vary? |
| Amplitude perturbation | How much does cycle-to-cycle amplitude vary? |
| Spectral noise | How much non-harmonic/turbulent energy is present? |
| Voice interruptions | Are there unvoiced/voice-break regions? |
| Subharmonics | Is there evidence of period-doubling/subharmonic behavior? |
| Tremor | Is there low-frequency frequency/amplitude modulation? |
| Sample descriptors | What segment and how many valid cycles were analyzed? |

## 7. Parameter registry

| Parameter | What is measured | Unit | Why / purpose | Configured reference | Interpretation boundary | Data source |
|---|---|---|---|---|---|---|
| F0/MF0 | Mean voiced-period fundamental frequency | Hz | Baseline pitch | Male 100–150; female 180–240 Hz | Task-, age-, sex- and physiology-dependent; not diagnostic alone | PhonaCore + MDVP paired output |
| Fhi | Maximum valid F0 | Hz | Upper pitch boundary | ~212–293 Hz | Maximum is task dependent | PhonaCore + MDVP |
| Flo | Minimum valid F0 | Hz | Lower pitch boundary | ~148–257 Hz, cohort dependent | Do not diagnose vocal fry from this alone | PhonaCore + MDVP |
| STD | SD of F0 | Hz | Overall pitch stability | ≤2.115 Hz | Affected by intentional pitch movement | PhonaCore + MDVP |
| T0 | Mean pitch period, approximately 1000/F0 | ms | Temporal basis of period measures | Inverse of F0 | Derived from F0 | PhonaCore + MDVP |
| Jita | Mean absolute consecutive-period difference | µs | Absolute short-term pitch variability | ≤83.200 µs | Sensitive to pitch extraction/noise | Period sequence + MDVP |
| Jitt | Relative consecutive-period variability | % | Standardized micro-jitter | ≤1.040% | Requires matched algorithm | Period sequence + MDVP |
| RAP | Relative pitch perturbation, 3-period window | % | Short-term pitch perturbation | ≤0.680% | Window must match reference | Period sequence + MDVP |
| PPQ | Relative pitch perturbation, 5-period window | % | Medium-short pitch variation | ≤0.840% | Window must match reference | Period sequence + MDVP |
| sPPQ | Long-window pitch perturbation | % | Longer-term pitch variation | ≤1.020% | Window/sample-length dependent | Period sequence + MDVP |
| vF0 | 100×SD(F0)/mean(F0) | % | Overall relative F0 variation | ≤1.100% | Can include intentional pitch changes | F0 track + MDVP |
| ShdB | Period-to-period amplitude variability in dB | dB | Short-term amplitude instability | ≤0.350 dB | Gain/microphone dependent | Period amplitude + MDVP |
| Shim | Relative period amplitude variability | % | Short-term amplitude perturbation | ≤3.810% | Requires consistent amplitude definition | Period amplitude + MDVP |
| APQ | Amplitude perturbation, 11-period window | % | Medium-term amplitude variability | ≤3.070% | Window dependent | Period amplitude + MDVP |
| sAPQ | Long-window amplitude perturbation | % | Longer-term amplitude variation | ≤4.230% | Window/sample-length dependent | Period amplitude + MDVP |
| vAm | 100×SD(amplitude)/mean(amplitude) | % | Overall amplitude variation | ≤8.200% | Gain and amplitude extraction matter | Period amplitude + MDVP |
| NHR | Inharmonic energy / harmonic energy | ratio | Spectral noise description | ≤0.190 | Method-, vowel- and environment-dependent | Spectrum + MDVP |
| VTI | High-frequency inharmonic/harmonic energy ratio | ratio | Turbulence/noise descriptor | ≤0.061 | Method dependent; not a closure diagnosis | Spectrum + MDVP |
| SPI | Low-frequency harmonic/high-frequency harmonic energy | ratio | Harmonic energy distribution | ≤14.120 | Strong vowel/formant dependence | Spectrum + MDVP |
| DVB | Voice-break duration / total sample | % | Phonatory interruption | 0.000% | Voicing algorithm/task dependent | Voicing track + MDVP |
| DSH | Relative subharmonic evidence | % | Subharmonic/nonlinear behavior | 0.000% | Current PhonaCore method is heuristic until validated | Period/F0 analysis + MDVP |
| DUV | Relative unvoiced/non-harmonic portion | % | Voicing continuity | 0.000% | Pauses/task can increase it | Voicing track + MDVP |
| NUV | Number of unvoiced segments | count | Discrete voicing gaps | 0 | Algorithm dependent | Voicing segmentation + MDVP |
| NVB | Number of voice breaks | count | Discrete phonatory interruptions | 0 | Algorithm dependent | Voicing segmentation + MDVP |
| NSH | Number of subharmonic segments | count | Discrete subharmonic events | 0 | Current method is heuristic until validated | Subharmonic detection + MDVP |
| SEG | Computational frame segments | count | Reproducibility/context | Sample dependent | Not a clinical outcome | PhonaCore |
| PER | Valid pitch periods | count | Data adequacy/weighting | Sample dependent | Low count should trigger review | PhonaCore |
| PFR | 12×log2(Fhi/Flo) | semitones | Pitch spread | <2.50 semitones | Mainly for standardized sustained tasks | Fhi/Flo + MDVP |
| FTRI | Dominant low-frequency F0 modulation magnitude | % | Frequency-tremor descriptor | ≤0.220% | Not a neurological diagnosis | F0 modulation + MDVP |
| ATRI | Low-frequency amplitude modulation magnitude | % | Amplitude-tremor descriptor | ≤2.860% | Recording/amplitude dependent | Amplitude modulation + MDVP |
| Fftr | Dominant F0 modulation frequency | Hz | Tremor modulation rate | 0 when below configured detection threshold | Frequency alone is not a disease diagnosis | F0 modulation + MDVP |
| Fatr | Dominant amplitude modulation frequency | Hz | Amplitude modulation rate | 0 when below configured detection threshold | Requires adequate duration | Amplitude modulation + MDVP |
| Tsam | Duration actually analyzed | sec | Quality/reproducibility | 1–3 s analysis segment | Acquisition duration and analysis duration must be stored separately | Recording metadata + analysis window |

## 8. Primary MDVP validation core
The supplied document defines a 16-parameter core:
F0, Fhi, Flo, STD, Jita, Jitt, RAP, PPQ, sPPQ, vF0, ShdB, Shim, APQ, sAPQ, vAm and NHR.

The exact same WAV must be processed by MDVP and PhonaCore. Sequential recordings must not substitute for paired validation.

Agreement statistics:
- CCC
- ICC(3,1)
- Bias
- Bland–Altman 95% limits of agreement

## 9. Interpretation boundary
A PhonaCore measurement is not a diagnosis. A threshold crossing does not independently establish dysphonia, lesion, breathiness, glottal insufficiency, tremor, neurological disease or any other diagnosis.

Patient-facing PASS/FAIL must be labelled a configured acoustic-reference screening result. It must not be presented as clinical diagnosis.

## 10. Data source requirements
Every dataset/recording source must document:
source name, owner/creator, citation, URL, permission/license, speaker count, demographics, task, recording conditions, sampling rate, format, labels/ground truth, intended use, import date and file hash/version.

## 11. Required source categories
### MDVP reference
Used for parameter definitions, reference processing framework and paired numerical validation.

### Doctor/clinician speech
If included, this is a separate auditable source. Collect only with appropriate permission/consent. Record speaker code, role, demographics when approved, task, device, microphone geometry, sampling rate, environment, consent/permission, file hash, session and analysis build.

Do not label a doctor's speech as normal merely because the speaker is a doctor.

### Other external voice datasets
Each external dataset must remain traceable to its original source and must not be silently merged into the human study dataset.

## 12. Pre-data-collection requirement
The measurement registry, acquisition protocol, source registry, consent/data-governance procedure, analysis build, quality gate, export schema and validation workflow must be completed before human-data collection is opened.
