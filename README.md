![CI](https://github.com/aether56tk/PhonaCore-ASLP/actions/workflows/ci.yml/badge.svg)

# PhonaCore-ASLP

**Browser-based acoustic voice analysis, clinical assessment and research software for Audiology & Speech-Language Pathology.**

Live application: https://aether56tk.github.io/PhonaCore-ASLP/

## What is complete

PhonaCore contains software workflows for guided voice recording, acoustic measurement, signal-quality checks, clinical documentation, reporting, research datasets and metadata, reliability/validity analysis, algorithm-validation workflows, synthetic benchmarking, reproducibility metadata, security/privacy controls, tele-assessment workflow components, and automated CI/software tests.

## Measurement boundary

The implementation is **research-oriented**. Parameter names and documented MDVP-oriented specifications are explicitly separated from any claim of equivalence with commercial MDVP software.

Software tests, synthetic signals, internal consistency checks and validation tooling demonstrate software behavior; they do **not** establish clinical validity or equivalence to a reference instrument.

## Validation status

**The only remaining research milestone is empirical validation against appropriate reference/human data.**

Required steps:

1. Governed, de-identified dataset.
2. Frozen recording and preprocessing protocol.
3. Reference measurements/annotations.
4. Frozen PhonaCore algorithm/version.
5. Paired comparison with the reference method.
6. Appropriate agreement/error statistics.
7. Failure-case and justified subgroup analysis.
8. Reproducible final reporting.

Until those steps are completed, do not describe PhonaCore measurements as clinically validated or equivalent to MDVP.

## Development

Requires Node.js 20+.

    npm install
    npm test
    npm run check
    npm run synthetic:benchmark
    npm run ci
    npm start

Local development server: http://localhost:5173

## Architecture

    public/        Browser UI and workflow
    src/acoustic   Measurement policy
    src/clinical   Data governance
    src/dsp.js     Signal processing
    src/research   Study/validation/reproducibility logic
    src/validation Validation metrics/protocol/reporting
    src/security   Security controls
    src/telehealth Tele-assessment workflow
    tests/         Automated verification

## Privacy

Do not place personal identifiers, patient records, consent documents, clinical recordings or other sensitive data in this public repository or GitHub Pages deployment. Use approved storage and institutional procedures for real research/clinical data.

## Documentation

The repository includes measurement documentation, MDVP reference/validation methodology, data-source registries, study protocol, reproducibility and research-validation workflows.

## Status

**Software implementation:** complete

**Automated software verification:** complete

**Research/validation framework:** complete

**Empirical clinical/research validation:** pending

## Project files

- [Security policy](SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)
- [Validation status](VALIDATION_STATUS.md)
- [Citation metadata](CITATION.cff)

## License

No open-source license is currently specified in the repository.
