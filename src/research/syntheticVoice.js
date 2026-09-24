import {mdvpPerturbation,mean,sd,analyzeVoice} from '../dsp.js';

export function sineVoice({sampleRate=16000,periods=120,baseF0=120,jitterPct=0,amplitude=0.5,amplitudeVariationPct=0,seed=1}={}){
  let state=seed>>>0;
  const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296};
  const periodsSec=[];
  const amps=[];
  for(let i=0;i<periods;i++){
    const jitter=(rand()*2-1)*jitterPct/100;
    periodsSec.push((1/baseF0)*(1+jitter));
    const av=(rand()*2-1)*amplitudeVariationPct/100;
    amps.push(amplitude*(1+av));
  }
  const total=Math.round(periodsSec.reduce((a,b)=>a+b,0)*sampleRate);
  const samples=new Float32Array(total);
  let pos=0,phase=0;
  for(let i=0;i<periodsSec.length&&pos<total;i++){
    const n=Math.max(2,Math.round(periodsSec[i]*sampleRate));
    const a=amps[i];
    for(let k=0;k<n&&pos+k<total;k++)samples[pos+k]=a*Math.sin(phase+2*Math.PI*k/n);
    phase+=2*Math.PI;
    pos+=n;
  }
  const f0=periodsSec.map(p=>1/p);
  const shimmerRatios=[];for(let i=1;i<amps.length;i++)shimmerRatios.push(Math.abs(amps[i]-amps[i-1])/((amps[i]+amps[i-1])/2));
  const theoretical={
    f0Mean:mean(f0),
    f0Sd:sd(f0),
    jittPct:jitterPct===0?0:100*mean(periodsSec.map((p,i)=>Math.abs(p-(periodsSec[i-1]??p))))/mean(periodsSec),
    rapPct:mdvpPerturbation(periodsSec,3),
    ppqPct:mdvpPerturbation(periodsSec,5),
    sppqPct:mdvpPerturbation(periodsSec,55),
    vf0Pct:100*sd(f0)/mean(f0),
    amplitudeMean:mean(amps),
    amplitudeSd:sd(amps),
    vamPct:100*sd(amps)/mean(amps),
    apqPct:mdvpPerturbation(amps,11),
    sapqPct:mdvpPerturbation(amps,55)
  };
  return {sampleRate,samples,groundTruth:{periodsSec,amps,theoretical}};
}

export function runSyntheticBench(){
  const cases=[
    {id:'constant-120hz',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:0},
    {id:'jitter-120hz',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:0},
    {id:'amplitude-variation',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:8},
    {id:'combined-variation',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:8}
  ];
  return cases.map((config,index)=>{
    const v=sineVoice({...config,seed:index+7});
    return {id:config.id,expected:v.groundTruth.theoretical};
  });
}


export function benchmarkSyntheticCase(config={},tolerances={}){
  const v=sineVoice(config);
  const measured=analyzeVoice(v.samples,v.sampleRate);
  const expected=v.groundTruth.theoretical;
  const checks=[
    ['F0',expected.f0Mean,measured.f0Mean,tolerances.F0??2],
    ['Jitt',expected.jittPct,measured.jittPct,tolerances.Jitt??1],
    ['RAP',expected.rapPct,measured.rapPct,tolerances.RAP??1],
    ['PPQ',expected.ppqPct,measured.ppqPct,tolerances.PPQ??1],
    ['sPPQ',expected.sppqPct,measured.sppqPct,tolerances.sPPQ??1],
    ['vF0',expected.vf0Pct,measured.vf0Pct,tolerances.vF0??1],
    ['Shim',expected.shimPct,measured.shimPct,tolerances.Shim??3],
    ['APQ',expected.apqPct,measured.apqPct,tolerances.APQ??3],
    ['sAPQ',expected.sapqPct,measured.sapqPct,tolerances.sAPQ??3],
    ['vAm',expected.vamPct,measured.vamPct,tolerances.vAm??3]
  ];
  const results=checks.map(([parameter,expectedValue,actual,tolerance])=>{
    const error=Number.isFinite(expectedValue)&&Number.isFinite(actual)?actual-expectedValue:null;
    return {parameter,expected:Number.isFinite(expectedValue)?expectedValue:null,measured:Number.isFinite(actual)?actual:null,error,tolerance,status:error!==null&&Math.abs(error)<=tolerance?'PASS':'FAIL'};
  });
  return {caseId:config.id||'synthetic-case',sampleRate:v.sampleRate,periodCount:v.groundTruth.periodsSec.length,results,pass:results.every(x=>x.status==='PASS'),note:'Tolerances are engineering test thresholds, not MDVP equivalence criteria.'};
}

export function runSyntheticBenchmark(tolerances={}){
  const cases=[
    {id:'constant-120hz',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:0},
    {id:'jitter-120hz',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:0},
    {id:'amplitude-variation',periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:8},
    {id:'combined-variation',periods:120,baseF0:120,jitterPct:2,amplitudeVariationPct:8}
  ];
  const reports=cases.map(c=>benchmarkSyntheticCase(c,tolerances));
  return {generatedAt:new Date().toISOString(),cases:reports,overallPass:reports.every(r=>r.pass),tolerances,note:'Synthetic benchmark verifies implementation behavior against generated mathematical ground truth; it does not establish equivalence to MDVP.'};
}
