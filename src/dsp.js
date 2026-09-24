export function mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN}
export function median(a){if(!a.length)return NaN;const x=[...a].sort((a,b)=>a-b),m=x.length>>1;return x.length%2?x[m]:(x[m-1]+x[m])/2}
export function sd(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
export function rms(a){return a.length?Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length):0}
export function peak(a){let p=0;for(const x of a)p=Math.max(p,Math.abs(x));return p}
export function removeDC(a){const m=mean(a);return a.map(x=>x-m)}
export function normalize(a){const p=peak(a);return p?a.map(x=>x/p):[...a]}
export function hann(n){const w=new Float32Array(n);for(let i=0;i<n;i++)w[i]=0.5*(1-Math.cos(2*Math.PI*i/(n-1)));return w}
export function frames(samples,sr,ms=40,hopMs=10){const n=Math.max(32,Math.round(sr*ms/1000)),hop=Math.max(1,Math.round(sr*hopMs/1000)),out=[];for(let i=0;i+n<=samples.length;i+=hop)out.push(samples.slice(i,i+n));return out}
export function autocorrelationF0(x,sr,minHz=70,maxHz=400){if(!x.length)return null;const lo=Math.max(1,Math.floor(sr/maxHz)),hi=Math.min(x.length-2,Math.ceil(sr/minHz));let best=-Infinity,bestLag=0;let energy=0;for(const v of x)energy+=v*v;if(!energy)return null;for(let lag=lo;lag<=hi;lag++){let c=0,e1=0,e2=0;for(let i=0;i<x.length-lag;i++){const a=x[i],b=x[i+lag];c+=a*b;e1+=a*a;e2+=b*b}const r=c/Math.sqrt((e1*e2)||1);if(r>best){best=r;bestLag=lag}}return best>.35?sr/bestLag:null}
export function pitchTrack(samples,sr){return frames(samples,sr).map((x,i)=>({time:i*.01,f0:autocorrelationF0(x,sr),rms:rms(x)}))}

/**
 * Period-level research extraction.
 * This creates one record per detected pitch period using a normalized
 * autocorrelation estimate for each short analysis frame, then refines
 * the period to the nearest local waveform peak pair. It is a
 * research-oriented estimator, not a claim of MDVP algorithm equivalence.
 */
export function extractPeriods(samples,sr,{minHz=70,maxHz=400,frameMs=40,hopMs=10}={}){
  const out=[];
  const fs=Math.max(32,Math.round(sr*frameMs/1000));
  const hop=Math.max(1,Math.round(sr*hopMs/1000));
  for(let start=0;start+fs<=samples.length;start+=hop){
    const frame=samples.slice(start,start+fs);
    const clean=removeDC(frame);
    const f0=autocorrelationF0(clean,sr,minHz,maxHz);
    if(!Number.isFinite(f0)||f0<=0)continue;
    const period=sr/f0;
    const center=start+Math.floor(fs/2);
    const half=Math.max(2,Math.round(period/2));
    const searchStart=Math.max(1,center-half);
    const searchEnd=Math.min(samples.length-2,center+half);
    let peakIndex=searchStart,peakValue=-Infinity;
    for(let i=searchStart;i<=searchEnd;i++){if(clean[i-(start)]>peakValue){peakValue=clean[i-start];peakIndex=i}}
    const nextStart=Math.min(samples.length-1,peakIndex+Math.max(1,Math.round(period*.75)));
    const nextEnd=Math.min(samples.length-2,peakIndex+Math.round(period*1.25));
    let next=nextStart,nextValue=-Infinity;
    for(let i=nextStart;i<=nextEnd;i++){const v=samples[i];if(v>nextValue){nextValue=v;next=i}}
    const T=(next-peakIndex)/sr;
    if(T<=0)continue;
    const A=Math.max(1e-12,nextValue-Math.min(...samples.slice(peakIndex,Math.min(samples.length,peakIndex+Math.max(2,Math.round(period))))));
    out.push({index:out.length,time:peakIndex/sr,startSample:peakIndex,endSample:next,periodSec:T,f0:1/T,peakToPeak:A,confidence:f0?Math.max(0,Math.min(1,(f0>=minHz&&f0<=maxHz)?1:0)):0});
  }
  return out;
}

export function periodSequenceFeatures(periods){
  const valid=periods.filter(p=>Number.isFinite(p.periodSec)&&p.periodSec>0&&Number.isFinite(p.f0)&&p.f0>0&&Number.isFinite(p.peakToPeak)&&p.peakToPeak>0);
  if(valid.length<3)return {validPeriods:valid.length,periods:[],f0:[],amplitude:[]};
  return {validPeriods:valid.length,periods:valid.map(p=>p.periodSec),f0:valid.map(p=>p.f0),amplitude:valid.map(p=>p.peakToPeak),records:valid};
}

/**
 * MDVP-oriented perturbation helper.
 * For odd windows (3/5/11/55), compare each center value with the
 * moving-average value across the full window, then average the
 * absolute relative deviation over valid centers.
 */
export function mdvpPerturbation(values,window){
  if(!Array.isArray(values)||values.length<window||window<3||window%2===0)return null;
  const half=Math.floor(window/2),overall=mean(values),out=[];
  if(!Number.isFinite(overall)||overall===0)return null;
  for(let i=half;i<values.length-half;i++){
    const w=values.slice(i-half,i+half+1),local=mean(w);
    if(Number.isFinite(local)&&Number.isFinite(values[i]))out.push(Math.abs(values[i]-local)/Math.abs(overall));
  }
  return out.length?100*mean(out):null;
}

export { MDVP_PARAMETER_SPEC };

export function periodSeries(input){
  if(!Array.isArray(input))return [];
  if(input.length&&Number.isFinite(input[0]?.periodSec)&&Number.isFinite(input[0]?.f0))return input.filter(x=>Number.isFinite(x.periodSec)&&x.periodSec>0&&Number.isFinite(x.f0)&&x.f0>0);
  return input.filter(x=>x.f0&&x.f0>0).map(x=>({periodSec:1/x.f0,f0:x.f0}));
}

function amplitudeSeries(input){
  if(!Array.isArray(input))return [];
  if(input.length&&Number.isFinite(input[0]?.peakToPeak))return input.filter(x=>Number.isFinite(x.peakToPeak)&&x.peakToPeak>0);
  return input.filter(x=>x.f0&&x.rms>0).map(x=>({peakToPeak:x.rms}));
}

function periodFeatures(input){
  const records=periodSeries(input),periods=records.map(x=>x.periodSec);
  if(periods.length<3)return {periods,jitaUs:null,jittPct:null,rapPct:null,ppqPct:null,sppqPct:null,vf0Pct:null,t0Ms:null};
  const diffs=[];for(let i=1;i<periods.length;i++)diffs.push(Math.abs(periods[i]-periods[i-1]));
  const av=mean(periods),f0s=records.map(x=>x.f0);
  return {periods,jitaUs:mean(diffs)*1e6,jittPct:100*mean(diffs)/av,rapPct:mdvpPerturbation(periods,3),ppqPct:mdvpPerturbation(periods,5),sppqPct:mdvpPerturbation(periods,55),vf0Pct:100*sd(f0s)/mean(f0s),t0Ms:av*1000};
}

function amplitudeFeatures(input){
  const records=amplitudeSeries(input),a=records.map(x=>x.peakToPeak);
  if(a.length<3)return {shimPct:null,shdB:null,apqPct:null,sapqPct:null,vamPct:null};
  const ratios=[],db=[];for(let i=1;i<a.length;i++){ratios.push(Math.abs(a[i]-a[i-1])/((a[i]+a[i-1])/2));db.push(Math.abs(20*Math.log10(a[i]/a[i-1])))}
  return {shimPct:100*mean(ratios),shdB:mean(db),apqPct:mdvpPerturbation(a,11),sapqPct:mdvpPerturbation(a,55),vamPct:100*sd(a)/mean(a)};
}

const MDVP_PARAMETER_SPEC=Object.freeze({RAP:{name:'Relative Average Perturbation',windowPeriods:3,unit:'%',basis:'pitch-period moving average'},PPQ:{name:'Pitch Period Perturbation Quotient',windowPeriods:5,unit:'%',basis:'pitch-period moving average'},sPPQ:{name:'Smoothed Pitch Period Perturbation Quotient',windowPeriods:55,unit:'%',basis:'user-configurable smoothing; factory default 55 periods'},vF0:{name:'Coefficient of Fundamental Frequency Variation',windowPeriods:null,unit:'%',basis:'100 × SD(F0) / mean(F0) across analyzed periods'},APQ:{name:'Amplitude Perturbation Quotient',windowPeriods:11,unit:'%',basis:'peak-to-peak amplitude moving average'},sAPQ:{name:'Smoothed Amplitude Perturbation Quotient',windowPeriods:55,unit:'%',basis:'user-configurable smoothing; factory default 55 periods'},vAm:{name:'Coefficient of Amplitude Variation',windowPeriods:null,unit:'%',basis:'100 × SD(peak-to-peak amplitude) / mean(peak-to-peak amplitude)'}});

function spectralNoise(samples,sr,f0){
  const n=Math.min(4096,samples.length);if(n<512||!f0)return{nhr:null,vti:null,spi:null};
  const x=samples.slice(0,n),w=hann(n);let harm=0,highNon=0,lowH=0,highH=0;
  const binHz=sr/n;
  for(let k=1;k<n/2;k++){
    let re=0,im=0;
    for(let t=0;t<n;t++){const ang=2*Math.PI*k*t/n,v=x[t]*w[t];re+=v*Math.cos(ang);im-=v*Math.sin(ang)}
    const e=re*re+im*im,hz=k*binHz;
    if(hz<70||hz>5800)continue;
    const nearest=Math.abs(hz/Math.max(f0,1)-Math.round(hz/Math.max(f0,1)));
    const isH=nearest<0.03||nearest>0.97;
    if(isH&&hz<=4500){harm+=e;if(hz<=1600)lowH+=e;if(hz>=1600)highH+=e}
    if(!isH&&hz>=1500&&hz<=4500)highNon+=e;
  }
  return {nhr:harm?highNon/harm:null,vti:harm?highNon/harm:null,spi:highH?lowH/highH:null};
}

function spectralCepstrumCPP(samples,sr){
  const n=2048;if(samples.length<n)return null;let best=-Infinity;
  for(let start=0;start+n<=samples.length;start+=Math.floor(n/2)){
    const x=samples.slice(start,start+n),w=hann(n),re=new Float64Array(n),im=new Float64Array(n);
    for(let k=0;k<n;k++){let rr=0,ii=0;for(let t=0;t<n;t++){const ang=2*Math.PI*k*t/n,v=x[t]*w[t];rr+=v*Math.cos(ang);ii-=v*Math.sin(ang)}re[k]=rr;im[k]=ii}
    const logp=new Float64Array(n);for(let k=0;k<n;k++)logp[k]=Math.log(Math.max(1e-12,re[k]*re[k]+im[k]*im[k]));
    for(let q=Math.round(sr/400);q<=Math.min(Math.round(sr/70),n/2);q++){let c=0;for(let k=0;k<n;k++)c+=logp[k]*Math.cos(2*Math.PI*k*q/n);best=Math.max(best,c/n)}
  }
  return Number.isFinite(best)?best:null;
}

export function taskSpecificMetrics(samples,sr,task='vowel'){
  const x=removeDC(samples), duration=x.length/sr, abs=x.map(v=>Math.abs(v));
  const rmsDb=20*Math.log10(Math.max(rms(x),1e-9));
  const track=pitchTrack(normalize(x),sr), f0=track.filter(v=>Number.isFinite(v.f0)).map(v=>v.f0);
  const voiced=track.filter(v=>Number.isFinite(v.f0)), intensity=track.map(v=>20*Math.log10(Math.max(v.rms,1e-9)));
  const result={task,durationSec:duration,mptSec:null,pitchRangeSemitones:null,pitchMinHz:null,pitchMaxHz:null,intensityMeanDb:rmsDb,intensityMinDb:null,intensityMaxDb:null,voicedPct:track.length?voiced.length/track.length*100:0};
  if(f0.length){result.pitchMinHz=Math.min(...f0);result.pitchMaxHz=Math.max(...f0);result.pitchRangeSemitones=12*Math.log2(result.pitchMaxHz/result.pitchMinHz)}
  if(intensity.length){result.intensityMinDb=Math.min(...intensity);result.intensityMaxDb=Math.max(...intensity);result.intensityMeanDb=mean(intensity)}
  if(task==='mpt'||task==='vowel'){const threshold=Math.max(0.015,peak(x)*0.12);let best=0,run=0;for(const v of abs){if(v>=threshold)run++;else{best=Math.max(best,run);run=0}}best=Math.max(best,run);result.mptSec=best/sr}
  return result;
}
export function measurementGate(a){
  const issues=[], status={};
  const checks={duration:a.durationSec>=2,voicing:a.voicedPct>=30,clipping:a.clippedPct<=1,cycles:(a.periods||[]).length>=3};
  if(!checks.duration)issues.push('Recording shorter than 2 seconds');
  if(!checks.voicing)issues.push('Insufficient voiced material');
  if(!checks.clipping)issues.push('Clipping exceeds 1%');
  if(!checks.cycles)issues.push('Insufficient reliable voice periods');
  const core=['f0Mean','f0Min','f0Max','f0Sd','jitaUs','jittPct','rapPct','ppqPct','sppqPct','vf0Pct','shdB','shimPct','apqPct','sapqPct','vamPct','nhr'];
  for(const k of core)status[k]=checks.voicing&&checks.cycles&&Number.isFinite(a[k])?'valid':Number.isFinite(a[k])?'limited':'unavailable';
  return {overall:issues.length?'limited':'valid',issues,status};
}
export function analyzeVoice(samples,sr){
  const clean=normalize(removeDC(samples)),duration=samples.length/sr,p=peak(samples),r=rms(samples);
  const track=pitchTrack(clean,sr),periods=extractPeriods(clean,sr),seq=periodSequenceFeatures(periods),voiced=track.filter(x=>x.f0),f0s=voiced.map(x=>x.f0);
  const pf=periodFeatures(track),af=amplitudeFeatures(track),periodLevel=periodSequenceFeatures(periods),periodPf=periodLevel.validPeriods>=3?periodFeatures(periodLevel.records.map(p=>({f0:p.f0,rms:p.peakToPeak}))):pf,periodAf=periodLevel.validPeriods>=3?amplitudeFeatures(periodLevel.records.map(p=>({f0:p.f0,rms:p.peakToPeak}))):af,noise=spectralNoise(clean,sr,mean(f0s)),cpp=spectralCepstrumCPP(clean,sr);
  const clipped=samples.length?samples.filter(x=>Math.abs(x)>=.99).length/samples.length*100:0;
  const voicedPct=track.length?voiced.length/track.length*100:0;
  const quality=Math.max(0,Math.min(100,Math.round(100-0.5*clipped-0.35*Math.max(0,40-voicedPct))));
  const taskMetrics=taskSpecificMetrics(samples,sr,'vowel');
  const f0Mean=mean(f0s),f0Min=f0s.length?Math.min(...f0s):null,f0Max=f0s.length?Math.max(...f0s):null;
  return {
    sampleRate:sr,durationSec:duration,f0Mean,f0Median:median(f0s),f0Min,f0Max,f0Sd:sd(f0s),
    pfrSemitones:f0Min&&f0Max?12*Math.log2(f0Max/f0Min):null,
    jitaUs:periodPf.jitaUs,jitterLocalPct:periodPf.jittPct,jittPct:periodPf.jittPct,rapPct:periodPf.rapPct,ppqPct:periodPf.ppqPct,
    sppqPct:periodPf.sppqPct,vf0Pct:periodPf.vf0Pct,t0Ms:periodPf.t0Ms,
    shimmerLocalPct:periodAf.shimPct,shimPct:periodAf.shimPct,shdB:periodAf.shdB,apqPct:periodAf.apqPct,sapqPct:periodAf.sapqPct,vamPct:periodAf.vamPct,
    nhr:noise.nhr,vti:noise.vti,spi:noise.spi,cppPrototypeDb:cpp,voicedPct,clippedPct:clipped,
    rmsDb:20*Math.log10(Math.max(r,1e-9)),peakDb:20*Math.log10(Math.max(p,1e-9)),
    quality:{score:quality,label:quality>=80?'Good':quality>=60?'Review':'Poor',issues:[...(clipped>1?['Clipping detected']:[]),...(voicedPct<30?['Low voiced-frame proportion']:[]),...(duration<2?['Short recording']:[])]},
    pitchTrack:track,periods,periodLevel,
    measurementStatus:{
      core:'research',
      gate:measurementGate({durationSec:duration,voicedPct,clippedPct:clipped,periods}),
      task:taskMetrics,
      mdvpComparable:['F0','Fhi','Flo','STD','Jita','Jitt','RAP','PPQ','sPPQ','vF0','ShdB','Shim','APQ','sAPQ','vAm','NHR'],
      note:'MDVP-oriented definitions and default smoothing windows are implemented as research targets; equivalence still requires paired empirical validation against the reference software.'
    }
  };
}
export function stats(a){const x=a.filter(Number.isFinite);return{n:x.length,mean:mean(x),median:median(x),sd:sd(x),min:x.length?Math.min(...x):NaN,max:x.length?Math.max(...x):NaN}}
