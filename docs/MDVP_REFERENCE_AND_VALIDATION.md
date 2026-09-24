# MDVP — Reference and Validation Documentation

## Source
Supplied project document: MDVP Manual and PhonaCore Validation_copy.pdf.

## Acquisition framework
- Sustained /a/
- Comfortable pitch and loudness
- 3–5 second acquisition
- Professional microphone
- 4–15 cm from mouth
- Approximately 45° off-axis
- 25–50 kHz sampling described by the supplied framework
- DC-offset removal
- Stationary middle segment
- Attack/decay removal
- Autocorrelation + peak-picking pitch extraction
- Perturbation calculations restricted to continuous periodic cycles

## PhonaCore validation standard
The supplied validation protocol specifies PCM WAV at 44.1 or 50 kHz, 16/24-bit, mono, with a stationary 1–3 second analysis segment. The same WAV must be processed by both systems.

## Acceptance targets
| Domain | Parameters | Target |
|---|---|---|
| Pitch baseline | F0, Fhi, Flo, STD | CCC > 0.99; absolute bias < 0.50 Hz |
| Frequency perturbation | Jita, Jitt, RAP, PPQ, sPPQ, vF0 | ICC > 0.95; absolute bias < 0.05% |
| Amplitude perturbation | ShdB, Shim, APQ, sAPQ, vAm | ICC > 0.92; absolute bias < 0.05 dB |
| Spectral noise | NHR, VTI, SPI | CCC > 0.90; absolute bias < 0.01 |
| Nonlinear interruptions | DVB, DSH, DUV, NUV, NSH, NVB | categorical concordance > 98% |

These are project validation targets, not achieved results.
