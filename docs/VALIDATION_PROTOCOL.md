# PhonaCore-ASLP Empirical Validation Protocol

## Purpose
Evaluate acoustic measurements against an appropriate reference method using a frozen, reproducible protocol.

## Dataset
Use a governed, de-identified dataset with:
- recording metadata
- task/phonation context
- sampling rate
- microphone/recording chain metadata where available
- reference measurements
- predefined quality/failure labels where available

## Freeze before comparison
Record:
- PhonaCore commit SHA
- dependency versions
- preprocessing parameters
- measurement configuration
- dataset version
- reference-method version/procedure

No measurement algorithm changes should be introduced after the validation dataset is opened without restarting the validation plan.

## Outcomes
For each parameter, report appropriate:
- signed error
- absolute error
- bias and dispersion
- agreement analysis
- predefined acceptance bands where justified
- failure rate

Use parameter-appropriate agreement methods; correlation alone is not sufficient to establish agreement.

## Subgroups and failures
Predefine clinically/research-relevant subgroups where sample size permits. Preserve failed recordings and report reasons instead of silently excluding them.

## Boundary
Synthetic benchmarks establish software behavior. They do not establish clinical validity or equivalence to MDVP or another commercial reference.
