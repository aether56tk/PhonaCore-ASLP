# PhonaCore-ASLP — MDVP Measurement Specification

## Reference basis

Primary reference target: Multi-Dimensional Voice Program (MDVP), Kay Elemetrics/KayPENTAX. The historical Model 4305 manual is the authoritative source to obtain locally from the MDVP installation/manual supplied with the laboratory system. Public literature independently describes the parameter definitions, but literature should not replace the exact installed-version manual.

### Sources reviewed
- Kay Elemetrics MDVP Model 4305 Quick Reference Guide/manual material: historical MDVP documentation covering parameter groups and analysis workflow.
- Xue & Deliyski: parameters explicitly defined according to the Multi-Dimensional Voice Program Model 4305 Manual (Kay Elemetrics Group, 1992).
- J. Clin. Med. 2024, 13, 7631: table describing MDVP parameters and comparison with another acoustic system.
- Praat documentation: independent descriptions of Jita, RAP and PPQ5/MDVP terminology; useful for mathematical cross-checking, not as the MDVP authority.

## Parameter specification

| MDVP field | Unit | Operational meaning for validation |
|---|---:|---|
| F0 | Hz | Average fundamental frequency over extracted pitch periods |
| T0 | ms | Average pitch period |
| Fhi | Hz | Highest extracted fundamental frequency |
| Flo | Hz | Lowest extracted fundamental frequency |
| STD | Hz | Standard deviation of fundamental frequency |
| PFR | semitones | Phonatory fundamental-frequency range derived from Fhi/Flo |
| Jita | µs | Absolute period-to-period jitter |
| Jitt | % | Relative period-to-period variability |
| RAP | % | Relative average perturbation using a 3-period smoothing concept |
| PPQ | % | Pitch period perturbation quotient using a 5-period smoothing concept |
| sPPQ | % | Smoothed pitch-period perturbation quotient; long-term/smoothed period variability |
| vF0 | % | Fundamental-frequency variation |
| ShdB | dB | Period-to-period amplitude variation expressed in dB |
| Shim | % | Period-to-period amplitude variation expressed as percentage |
| APQ | % | Amplitude perturbation quotient; short-term amplitude variation |
| sAPQ | % | Smoothed amplitude perturbation quotient |
| vAm | % | Overall/peak-to-peak amplitude variation |
| NHR | ratio | Noise-to-harmonics relationship |
| VTI | ratio | Voice turbulence index |
| SPI | ratio | Soft phonation index |

## Validation rules

1. Same WAV file must be analysed by MDVP and PhonaCore for the primary comparison.
2. The MDVP version/model and all analysis settings must be recorded.
3. Sampling rate, bit depth, recording task, microphone, mouth-to-microphone distance and recording environment must be documented.
4. Units must be identical before comparison.
5. A shared parameter name is NOT sufficient evidence of mathematical equivalence.
6. Jitter/shimmer parameters require comparable valid-period extraction and exclusion rules.
7. NHR/VTI/SPI require exact algorithm/settings matching before they can be treated as direct MDVP-equivalent outputs.
8. Agreement statistics describe measurement agreement; they do not establish clinical equivalence or diagnostic validity.

## Evidence extracted from uploaded MDVP study

The uploaded Nicastro et al. (2004) study used MDVP software model 5105 version 2.3 with a Kay CSL 4300B, Shure SM48 microphone at 15 cm and 45 degrees, 50 kHz sampling, at least 6 seconds of sustained /a/, with the central 3 seconds analysed. The study maintained background noise below 30 dB, used 55–65 dB as the acceptable vocal intensity range, and set acquisition-channel saturation at 6/9. These are study-specific conditions and are not automatically the PhonaCore final protocol. fileciteturn46file0L156-L180

The uploaded study explicitly defines the following amplitude measures:
- **ShdB:** mean absolute peak-to-peak amplitude variability from one period to the next (short-term cycle-to-cycle irregularity).
- **Shim:** mean relative peak-to-peak amplitude variability between periods.
- **vAm:** mean relative amplitude variability over 11 periods using a one-step peak-to-peak comparison.
- **APQ:** mean relative amplitude variability over a default 55-period window using one-step peak-to-peak comparison.
- **SAPQ:** relative variability of the peak-to-peak amplitude standard deviation compared with the average peak-to-peak amplitude. fileciteturn46file0L181-L192

The same study reports normative reference values for these five measures, including overall means of ShdB 0.233 dB, Shim 2.538%, APQ 2.101%, SAPQ 3.212%, and vAm 6.800% across its 35 euphonic adults. These values are **not validation targets** for PhonaCore; they are descriptive values from that specific population/protocol. fileciteturn46file0L243-L250

## Current implementation status

- F0/Fhi/Flo/STD/T0: prototype
- Jita/Jitt: prototype
- RAP/PPQ/sPPQ: prototype; exact MDVP operational definitions still need implementation verification
- ShdB/Shim/APQ/sAPQ/vAm: prototype; exact MDVP amplitude-period extraction still needs verification
- NHR/VTI/SPI: prototype; must not be described as MDVP-equivalent yet
- CPP: additional PhonaCore metric; not a direct MDVP comparison endpoint

## Critical next action

Obtain the exact MDVP manual/version used for the study from the institution's licensed MDVP/CSL system. Record the model/version and analysis settings, then update this specification with the exact manual definitions and settings before final validation.

## Recording protocol candidate

A reproducible published MDVP study used 44.1 kHz, 16-bit recording, a headset microphone, and approximately 10 cm mouth-to-microphone distance in a sound-controlled room. This is a methodological example, not a mandatory PhonaCore protocol; the final protocol should be approved for the actual study.

## Statistical validation

For each directly comparable parameter:
- paired sample count
- missing/invalid count
- mean and SD for each system
- mean paired bias (PhonaCore − MDVP)
- MAE
- RMSE
- Bland–Altman 95% limits of agreement
- correlation as a supplementary association measure

Correlation must not be used as a substitute for agreement analysis.
