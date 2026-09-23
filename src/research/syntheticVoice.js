import {mdvpPerturbation,mean,sd} from '../src/dsp.js';

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
  const periods=periodsSec;
  const f0=periods.map(p=>1/p);
  const theoretical={
    f0Mean:mean(f0),
    f0Sd:sd(f0),
    jittPct:jitterPct===0?0:100*mean(periods.map((p,i)=>Math.abs(p-(periods[i-1]??p))))/mean(periods),
    rapPct:mdvpPerturbation(periods,3),
    ppqPct:mdvpPerturbation(periods,5),
    sppqPct:mdvpPerturbation(periods,55),
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
