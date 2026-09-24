# PhonaCore-ASLP Measurement Documentation

## Title
PhonaCore-ASLP Acoustic Voice Analysis and MDVP-Oriented Validation Study

## Background
PhonaCore analyzes voice recordings using acoustic measures covering fundamental frequency, frequency perturbation, amplitude perturbation, noise-related characteristics, voice breaks/subharmonics, tremor-related modulation and sample/segment descriptors.

## Aim
To document the measurements produced by PhonaCore and define their intended analytical purpose and interpretation boundaries before human-data collection and paired reference validation.

## Objectives
1. Define each measurement, unit and computational basis.
2. Document why each parameter is collected.
3. Record the configured project reference values.
4. Separate implemented prototype measures from validated equivalence.
5. Maintain reproducible documentation for clinical/research reporting.

## Purpose and interpretation
The measurements are objective acoustic descriptors of a recorded voice sample. They are intended to complement clinical history, perceptual assessment and other appropriate examination. A parameter outside a configured reference is not, by itself, a diagnosis.

## Measurement registry

| Parameter | What is measured | Unit | Purpose / basis | Configured reference |
|---|---|---|---|---|
| F0 | Average fundamental frequency | Hz | Overall pitch-period frequency | 100–150 male; 180–240 female |
| Fhi | Highest F0 | Hz | Upper observed F0 | ~212–293 Hz |
| Flo | Lowest F0 | Hz | Lower observed F0 | ~148–257 Hz |
| STD | F0 variability | Hz | Dispersion of F0 | ≤2.115 Hz |
| T0 | Average pitch period | ms | Period duration, 1000/F0 | inverse of F0 |
| Jita | Absolute period variability | µs | Short-term pitch-period change | ≤83.200 µs |
| Jitt | Relative period variability | % | Cycle-to-cycle pitch variability | ≤1.040% |
| RAP | Relative average perturbation | % | 3-period pitch perturbation | ≤0.680% |
| PPQ | Pitch perturbation quotient | % | 5-period pitch perturbation | ≤0.840% |
| sPPQ | Smoothed pitch perturbation | % | Long-window pitch variation | ≤1.020% |
| vF0 | F0 coefficient of variation | % | 100×SD(F0)/mean(F0) | ≤1.100% |
| ShdB | Shimmer in dB | dB | Period amplitude variability | ≤0.350 dB |
| Shim | Relative amplitude variability | % | Cycle-to-cycle amplitude variation | ≤3.810% |
| APQ | Amplitude perturbation quotient | % | 11-period amplitude variation | ≤3.070% |
| sAPQ | Smoothed amplitude perturbation | % | Long-window amplitude variation | ≤4.230% |
| vAm | Amplitude coefficient of variation | % | 100×SD(amplitude)/mean(amplitude) | ≤8.200% |
| NHR | Noise-to-harmonic ratio | ratio | Inharmonic relative to harmonic energy | ≤0.190 |
| VTI | Voice turbulence index | ratio | High-frequency noise/turbulence component | ≤0.061 |
| SPI | Soft phonation index | ratio | Low/high harmonic energy relationship | ≤14.120 |
| DVB | Degree of voice breaks | % | Relative voice-break duration | 0.000% |
| DSH | Degree of subharmonics | % | Subharmonic evidence | 0.000% |
| DUV | Degree of voiceless | % | Relative unvoiced proportion | 0.000% |
| NUV | Number of unvoiced segments | count | Unvoiced gaps | 0 |
| NVB | Number of voice breaks | count | Voiced interruptions | 0 |
| NSH | Number of subharmonic segments | count | Subharmonic segments | 0 |
| SEG | Total segments | count | Computational frame segments | sample dependent |
| PER | Pitch periods | count | Valid periodic cycles | sample dependent |
| PFR | Phonatory F0 range | semitones | 12×log2(Fhi/Flo) | <2.50 semitones |
| FTRI | Frequency tremor intensity | % | Low-frequency F0 modulation magnitude | ≤0.220% |
| ATRI | Amplitude tremor intensity | % | Low-frequency amplitude modulation | ≤2.860% |
| Fftr | F0 tremor frequency | Hz | Dominant F0 modulation frequency | 0 if below threshold |
| Fatr | Amplitude tremor frequency | Hz | Dominant amplitude modulation frequency | 0 if below threshold |
| Tsam | Analyzed sample length | sec | Duration of analyzed segment | 1.00–3.00 sec |

## Reference and validation note
The project uses the supplied MDVP manual/protocol as the reference framework for parameter naming, analysis and paired validation. The configured thresholds above are project reference values and must not be presented as universal norms. Empirical paired recordings are required before claiming equivalence with MDVP.

## Dataset/reference-source registry
The application should record every external speech/voice dataset or clinician recording source with: source name, owner/creator, URL or citation, license/permission, task, speaker demographics, sample count, recording conditions, and permitted use. Names mentioned during planning (including Varghee, Prachi, doctors' speech and MDDB) are **source labels to be verified**, not evidence that audio has been obtained. No external dataset is silently imported into the study.

## Data-collection rule
No human-data collection should begin until the pre-collection research gate, approved documentation, recording protocol, quality checks, participant/demographic requirements and data-integrity workflow are complete.
