import {sineVoice,benchmarkSyntheticCase,runSyntheticBenchmark} from './syntheticVoice.js';

export const ALGORITHM_PARAMETERS=['F0','Jitt','RAP','PPQ','sPPQ','vF0','Shim','APQ','sAPQ','vAm'];

export const STANDARD_BENCHMARK_CASES=[
 {id:'constant-120hz',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:0},
 {id:'jitter-120hz',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:0},
 {id:'amplitude-variation',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:8},
 {id:'combined-variation',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:8}
];

export const DEFAULT_TOLERANCES={F0:2,Jitt:1,RAP:1,PPQ:1,sPPQ:1,vF0:1,Shim:3,APQ:3,sAPQ:3,vAm:3};

export function runAlgorithmValidation(tolerances=DEFAULT_TOLERANCES){
 const benchmark=runSyntheticBenchmark(tolerances);
 const cases=benchmark.cases.map(x=>({...x,failures:x.results.filter(r=>r.status==='FAIL').map(r=>r.parameter)}));
 const parameterSummary=ALGORITHM_PARAMETERS.map(parameter=>{
  const rows=cases.flatMap(c=>c.results.filter(r=>r.parameter===parameter));
  const pass=rows.filter(r=>r.status==='PASS').length,fail=rows.length-pass;
  return {parameter,n:rows.length,pass,fail,passRate:rows.length?pass/rows.length:null,maxAbsError:rows.length?Math.max(...rows.map(r=>Math.abs(r.error??0))):null};
 });
 return {schemaVersion:'1.0',generatedAt:new Date().toISOString(),method:'controlled synthetic mathematical ground truth',tolerances,parameters:parameterSummary,cases,overallPass:benchmark.overallPass,limitations:['Synthetic validation tests implementation behavior; it does not establish clinical validity or MDVP equivalence.','Sine-wave ground truth does not represent dysphonic or highly irregular human phonation.','Engineering tolerances are pre-specified test thresholds, not clinical acceptance criteria.']};
}

export function validationReadiness(report){
 const issues=[];
 if(!report)issues.push('No validation run');
 if(report&&!report.overallPass)issues.push('One or more synthetic benchmark checks failed');
 if(report&&report.cases.some(c=>c.failures.length))issues.push('Parameter-level failures require algorithm review');
 return {ready:issues.length===0,issues};
}
