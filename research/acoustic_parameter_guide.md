# PhonaCore-ASLP Acoustic Parameter Teaching Guide

This guide provides plain-language descriptions for the acoustic voice parameters used or planned in PhonaCore-ASLP. It is intended for teaching and clinician/researcher orientation; parameter values must be interpreted in context and are not diagnostic by themselves.

## Tier 1 — Core voice measures

### F0 — Fundamental Frequency
Pitch, determined by the rate of vocal-fold vibration. More cycles per second generally means higher pitch.

**Analogy:** A guitar string plucked faster/tighter produces a higher note.

### Jitter
Cycle-to-cycle variation in fundamental period/F0 timing.

**Analogy:** A bicycle wheel that is slightly out of true: it still rotates, but not with perfectly even timing.

### Shimmer
Cycle-to-cycle variation in vocal amplitude.

**Analogy:** A speaker whose volume fluctuates slightly even though the volume control is unchanged.

### NHR — Noise-to-Harmonic Ratio
A measure describing the relative amount of noise compared with harmonic vocal energy.

**Analogy:** Radio static mixed into otherwise clean music.

### Mean Intensity / SPL
Average sound-pressure level of the voice.

**Simple teaching line:** This is essentially the average volume level of the recording.

## Tier 2 — Pitch habits and range

### Habitual Pitch (MF0)
The typical fundamental frequency used during ordinary connected speech.

**Analogy:** A person's default walking pace.

### Optimum Pitch
A pitch associated with efficient and comfortable phonation for the individual; it should not be treated as a universal single target value.

**Analogy:** A car's efficient gear for a particular driving condition.

### Phonational F0 Range
The range of fundamental frequencies that can be produced, from lowest to highest measured/phonated F0.

**Analogy:** The range of piano keys a person can reach and produce.

### Speaking F0 Range
The narrower portion of the available F0 range actually used during connected speech.

**Analogy:** A pianist has many keys available but normally uses only a subset during a particular passage.

## Tier 5 — Supporting measures

### Highest F0 (Fhi) / Lowest F0 (Flo)
The highest and lowest valid F0 observations in the analyzed sample.

**Simple teaching line:** The pitch ceiling and floor of the sample.

### F0 Standard Deviation (STD)
A measure of the overall spread/variability of F0 across the analyzed sample.

**Analogy:** Overall stride-length variability across an entire walk rather than comparing only two consecutive steps.

### Average Pitch Period (T0)
The average duration of one fundamental vocal-fold cycle. Conceptually, T0 is the time-per-cycle counterpart of F0.

**Simple teaching line:** F0 = cycles per second; T0 = seconds per cycle.

### vFo — F0 Variation
A broader measure of F0 variation across the sample, depending on the specific algorithm/software definition.

**Analogy:** Overall spread of golf shots rather than comparing only two consecutive shots.

### vAm — Amplitude Variation
A broader measure of amplitude variation across the sample, depending on the specific algorithm/software definition.

**Simple teaching line:** Overall loudness/amplitude wandering.

### Shimmer in dB (ShdB)
Shimmer expressed using a decibel-based measure rather than a percentage.

**Simple teaching line:** Same general phenomenon, different measurement scale.

### Intensity Range / Dynamic Range
The difference between lower and higher intensity levels represented in the analyzed voice sample.

**Analogy:** The span between a soft voice and a loud voice.

### Rise Time / Fall Time
The time required for the measured signal amplitude/intensity to increase or decrease according to the operational definition used by the analysis system.

**Analogy:** A light switch turning on/off abruptly versus a dimmer changing gradually.

## Teaching sequence

A useful way to teach the complete set is:

**F0 + intensity** → basic pitch and loudness  
↓  
**Jitter + shimmer + NHR** → short-term stability and noise characteristics  
↓  
**RAP / PPQ / APQ and related perturbation measures** → additional/smoothed measures of periodicity and amplitude variation  
↓  
**Tremor measures** → slower rhythmic modulation  
↓  
**Voice breaks / subharmonics / voicelessness** → major irregularity or loss of periodic voicing  
↓  
**Range, variation and timing measures** → additional descriptive information about how the voice is produced.

## Scientific implementation notes for PhonaCore-ASLP

- Jitter and shimmer require sufficiently reliable vocal cycles; highly irregular or poorly voiced segments may make these measures invalid or unstable.
- F0, jitter, shimmer and related measures should be accompanied by signal-quality/validity information.
- Browser capture settings can alter acoustic measurements. Measurement-oriented capture should avoid browser processing such as automatic gain control, noise suppression and echo cancellation when the platform and browser permit.
- NHR, CPP and other measures must preserve their exact operational definitions when compared across software packages; similarly named parameters are not automatically interchangeable.
- The platform should report measurements descriptively and avoid automatically labeling a value as “normal,” “abnormal,” or diagnostic.
- Research comparisons should document the algorithm, parameter settings, recording task, sampling rate, device/microphone, preprocessing state and valid-analysis criteria.

## Intended use

This document is a teaching and research-methods reference for PhonaCore-ASLP. It does not establish clinical reference ranges or diagnostic thresholds.
