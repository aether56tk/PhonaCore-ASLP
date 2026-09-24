(function(){
function mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN}
function median(a){if(!a.length)return NaN;const x=[...a].sort((a,b)=>a-b),m=x.length>>1;return x.length%2?x[m]:(x[m-1]+x[m])/2}
function sd(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function rms(a){return a.length?Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length):0}
function peak(a){let p=0;for(const x of a)p=Math.max(p,Math.abs(x));return p}
function removeDC(a){const m=mean(a);return a.map(x=>x-m)}
function normalize(a){const p=peak(a);return p?a.map(x=>x/p):[...a]}
function hann(n){const w=new Float32Array(n);for(let i=0;i<n;i++)w[i]=0.5*(1-Math.cos(2*Math.PI*i/(n-1)));return w}
function frames(samples,sr,ms=40,hopMs=10){const n=Math.max(32,Math.round(sr*ms/1000)),hop=Math.max(1,Math.round(sr*hopMs/1000)),out=[];for(let i=0;i+n<=samples.length;i+=hop)out.push(samples.slice(i,i+n));return out}
function nextPow2(n){let p=1;while(p<n)p<<=1;return p}
const FFT_CACHE=new Map();
function fftRadix2(re,im,inverse=false){
  const n=re.length;
  let cache=FFT_CACHE.get(n);
  if(!cache){
    const rev=new Uint32Array(n),levels=Math.log2(n);
    for(let i=0;i<n;i++){let x=i,y=0;for(let b=0;b<levels;b++){y=(y<<1)|(x&1);x>>=1}rev[i]=y}
    const cos=[],sin=[];
    for(let len=2;len<=n;len<<=1){
      const half=len>>1,step=2*Math.PI/len,cr=new Float64Array(half),si=new Float64Array(half);
      for(let j=0;j<half;j++){cr[j]=Math.cos(step*j);si[j]=Math.sin(step*j)}
      cos.push(cr);sin.push(si);
    }
    cache={rev,cos,sin};FFT_CACHE.set(n,cache);
  }
  for(let i=0;i<n;i++){const j=cache.rev[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  let level=0;
  for(let len=2;len<=n;len<<=1,level++){
    const half=len>>1,cr=cache.cos[level],si=cache.sin[level];
    for(let i=0;i<n;i+=len){
      for(let j=0;j<half;j++){
        const wr=cr[j],wi=inverse?si[j]:-si[j],k=i+j,m=k+half;
        const tr=wr*re[m]-wi*im[m],ti=wr*im[m]+wi*re[m];
        const ur=re[k],ui=im[k];re[k]=ur+tr;im[k]=ui+ti;re[m]=ur-tr;im[m]=ui-ti;
      }
    }
  }
  if(inverse){for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}}
  return {re,im};
}
function autocorrelationF0(x,sr,minHz=70,maxHz=400){
  if(!x.length)return null;
  const n=nextPow2(x.length*2),re=new Float64Array(n),im=new Float64Array(n);
  let energy=0;
  for(let i=0;i<x.length;i++){const v=x[i];re[i]=v;energy+=v*v}
  if(!energy)return null;
  fftRadix2(re,im,false);
  for(let i=0;i<n;i++)re[i]=re[i]*re[i]+im[i]*im[i],im[i]=0;
  fftRadix2(re,im,true);
  const lo=Math.max(1,Math.floor(sr/maxHz)),hi=Math.min(x.length-2,Math.ceil(sr/minHz));
  let best=-Infinity,bestLag=0;
  for(let lag=lo;lag<=hi;lag++){const r=re[lag]/energy;if(r>best){best=r;bestLag=lag}}
  return best>.35?sr/bestLag:null;
}
function medianFilterSeries(values,window=5){const half=Math.floor(window/2),out=[...values];for(let i=0;i<values.length;i++){const w=[];for(let j=Math.max(0,i-half);j<=Math.min(values.length-1,i+half);j++)if(Number.isFinite(values[j]))w.push(values[j]);if(w.length)out[i]=median(w)}return out}
function pitchTrack(samples,sr){const raw=frames(samples,sr,30,10).map((x,i)=>({time:i*.01,f0:autocorrelationF0(x,sr),rms:rms(x)}));const smoothed=medianFilterSeries(raw.map(x=>x.f0),5);const voiced=smoothed.filter(Number.isFinite);const center=median(voiced);const cleaned=smoothed.map(v=>Number.isFinite(v)&&Number.isFinite(center)&&v>=center*.55&&v<=center*1.80?v:null);const final=medianFilterSeries(cleaned,5);return raw.map((x,i)=>({...x,f0:final[i]}))}

/**
 * Period-level research extraction.
 * This creates one record per detected pitch period using a normalized
 * autocorrelation estimate for each short analysis frame, then refines
 * the period to the nearest local waveform peak pair. It is a
 * research-oriented estimator, not a claim of MDVP algorithm equivalence.
 */
function extractPeriods(samples,sr,{minHz=70,maxHz=400,frameMs=40,hopMs=10}={}){
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
    const expected=1/f0;
    if(T<=0||T<expected*.70||T>expected*1.30)continue;
    const A=Math.max(1e-12,nextValue-Math.min(...samples.slice(peakIndex,Math.min(samples.length,peakIndex+Math.max(2,Math.round(period))))));
    out.push({index:out.length,time:peakIndex/sr,startSample:peakIndex,endSample:next,periodSec:T,f0:1/T,peakToPeak:A,confidence:f0?Math.max(0,Math.min(1,(f0>=minHz&&f0<=maxHz)?1:0)):0});
  }
  return out;
}

function periodSequenceFeatures(periods){
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
function mdvpPerturbation(values,window){
  if(!Array.isArray(values)||values.length<window||window<3||window%2===0)return null;
  const half=Math.floor(window/2),overall=mean(values),out=[];
  if(!Number.isFinite(overall)||overall===0)return null;
  for(let i=half;i<values.length-half;i++){
    const w=values.slice(i-half,i+half+1),local=mean(w);
    if(Number.isFinite(local)&&Number.isFinite(values[i]))out.push(Math.abs(values[i]-local)/Math.abs(overall));
  }
  return out.length?100*mean(out):null;
}

function periodSeries(input){
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
  const n=Math.min(4096,nextPow2(samples.length));if(n<512||!f0)return{nhr:null,vti:null,spi:null};
  const re=new Float64Array(n),im=new Float64Array(n),w=hann(n);
  for(let t=0;t<n;t++)re[t]=(samples[t]||0)*w[t];
  fftRadix2(re,im,false);
  const binHz=sr/n;let harm=0,highNon=0,lowH=0,highH=0;
  for(let k=1;k<n/2;k++){
    const e=re[k]*re[k]+im[k]*im[k],hz=k*binHz;
    if(hz<70||hz>5800)continue;
    const ratio=hz/Math.max(f0,1),nearest=Math.abs(ratio-Math.round(ratio)),isH=nearest<.03||nearest>.97;
    if(isH&&hz<=4500){harm+=e;if(hz<=1600)lowH+=e;if(hz>=1600)highH+=e}
    if(!isH&&hz>=1500&&hz<=4500)highNon+=e;
  }
  const total=Math.max(1,harm);
  const minHighEnergy=Math.max(total*1e-5,1e-12);
  return{nhr:harm?highNon/harm:null,vti:harm?highNon/harm:null,spi:highH>minHighEnergy?lowH/highH:null};
}
function spectralCepstrumCPP(samples,sr){
  const n=2048;if(samples.length<n)return null;let best=-Infinity;
  for(let start=0;start+n<=samples.length;start+=n>>1){
    const re=new Float64Array(n),im=new Float64Array(n),w=hann(n);
    for(let t=0;t<n;t++)re[t]=samples[start+t]*w[t];
    fftRadix2(re,im,false);
    for(let k=0;k<n;k++){const mag=Math.sqrt(re[k]*re[k]+im[k]*im[k]);re[k]=20*Math.log10(Math.max(1e-12,mag));im[k]=0}
    fftRadix2(re,im,true);
    const lo=Math.max(1,Math.round(sr/400)),hi=Math.min(n/2,Math.round(sr/70));
    const xs=[],ys=[];for(let q=Math.max(1,Math.round(sr/500));q<=Math.min(n/2,Math.round(sr/50));q++){const quef=q/sr*1000;if(quef>=1&&quef<=20){xs.push(quef);ys.push(re[q])}}
    if(xs.length<3)continue;
    const xm=mean(xs),ym=mean(ys);let num=0,den=0;for(let i=0;i<xs.length;i++){num+=(xs[i]-xm)*(ys[i]-ym);den+=(xs[i]-xm)**2}
    const slope=den?num/den:0,intercept=ym-slope*xm;
    for(let q=lo;q<=hi;q++){const quef=q/sr*1000;if(quef<1||quef>20)continue;best=Math.max(best,re[q]-(slope*quef+intercept))}
  }
  return Number.isFinite(best)?Math.max(0,best):null;
}
function analyzeVoiceFast(samples,sr,task='vowel'){
  const originalDurationSec=samples.length/sr;
  let work=samples;
  if((task==='vowel'||task==='mpt')&&originalDurationSec>1.2){
    const trim=Math.min(Math.round(sr*.3),Math.floor(samples.length*.15));
    const steadyEnd=samples.length-trim;
    work=samples.slice(trim,Math.max(trim+1,steadyEnd));
    if(work.length>Math.round(sr*3)){
      const keep=Math.round(sr*3),start=Math.floor((work.length-keep)/2);
      work=work.slice(start,start+keep);
    }
  }
  const clean=normalize(removeDC(work)),durationSec=work.length/sr;
  const track=pitchTrack(clean,sr),voiced=track.filter(x=>Number.isFinite(x.f0)),f0s=voiced.map(x=>x.f0);
  const periods=extractPeriods(clean,sr),pf=periodFeatures(periods),af=amplitudeFeatures(periods);
  const periodRecords=periods;
  const periodsForOutput=periodRecords.map((x,i)=>({index:i,time:x.time,startSample:Math.max(0,Math.round(x.time*sr)),endSample:Math.max(0,Math.round((x.time+(1/x.f0))*sr)),periodSec:1/x.f0,f0:x.f0,peakToPeak:Math.max(1e-12,x.rms*2),confidence:1}));
  const noise=spectralNoise(clean,sr,mean(f0s)),cpp=spectralCepstrumCPP(clean,sr);
  const p=peak(samples),r=rms(samples),clipped=samples.length?samples.filter(x=>Math.abs(x)>=.99).length/samples.length*100:0;
  const voicedPct=track.length?voiced.length/track.length*100:0;
  const quality=Math.max(0,Math.min(100,Math.round(100-.5*clipped-.35*Math.max(0,40-voicedPct))));
  const f0Mean=f0s.length?mean(f0s):null,f0Min=f0s.length?Math.min(...f0s):null,f0Max=f0s.length?Math.max(...f0s):null;
  const periodMeanMs=Number.isFinite(f0Mean)&&f0Mean>0?1000/f0Mean:null;
  const consistentF0=f0Mean;
  const pfrSemitones=f0Min&&f0Max?12*Math.log2(f0Max/f0Min):null;
  const voicedFrames=track.filter(x=>Number.isFinite(x.f0));
  const unvoicedFrames=track.length-voicedFrames.length;
  const segments=[];let inSeg=false;for(const x of track){if(Number.isFinite(x.f0)&&!inSeg){segments.push(1);inSeg=true}else if(!Number.isFinite(x.f0))inSeg=false}
  return {
    sampleRate:sr,durationSec,f0Mean:consistentF0,f0Median:median(f0s),f0Min,f0Max,f0Sd:sd(f0s),
    pfrSemitones:pfrSemitones,
    jitaUs:pf.jitaUs,jitterLocalPct:pf.jittPct,jittPct:pf.jittPct,rapPct:pf.rapPct,ppqPct:pf.ppqPct,
    sppqPct:pf.sppqPct,vf0Pct:pf.vf0Pct,t0Ms:periodMeanMs,
    shimmerLocalPct:af.shimPct,shimPct:af.shimPct,shdB:af.shdB,apqPct:af.apqPct,sapqPct:af.sapqPct,vamPct:af.vamPct,
    nhr:noise.nhr,vti:noise.vti,spi:noise.spi,cppPrototypeDb:cpp,voicedPct,clippedPct:clipped,
    rmsDb:20*Math.log10(Math.max(r,1e-9)),peakDb:20*Math.log10(Math.max(p,1e-9)),
    quality:{score:quality,label:quality>=80?'Good':quality>=60?'Review':'Poor',issues:[...(clipped>1?['Clipping detected']:[]),...(voicedPct<30?['Low voiced-frame proportion']:[]),...(durationSec<2?['Short recording']:[])]},
    pitchTrack:track,periods:periodRecords,analysisWindow:{durationSec,originalDurationSec,selection:durationSec<originalDurationSec?'middle':'full'},periodLevel:{validPeriods:periods.length,periods:periodRecords.map(p=>p.periodSec),f0:periodRecords.map(p=>p.f0),amplitude:periodRecords.map(p=>p.peakToPeak),records:periodRecords},
    researchParameters:{PFR:pfrSemitones,SEG:track.length,PER:periods.length,DUV:track.length?100*unvoicedFrames/track.length:null,NUV:unvoicedFrames,NVB:Math.max(0,segments.length-1),NSH:null,DSH:null,FTRI:null,ATRI:null,Fftr:null,Fatr:null},
    measurementStatus:{
      core:'prototype-fast',
      mdvpComparable:['F0','Fhi','Flo','STD','Jita','Jitt','RAP','PPQ','sPPQ','vF0','ShdB','Shim','APQ','sAPQ','vAm','NHR'],
      note:'Fast live-analysis path uses short-time pitch/amplitude estimates for responsive mobile processing. Jitter/shimmer-style measures are research prototypes and require independent validation; they are not claimed equivalent to MDVP.'
    }
  };
}
function analyzeVoice(samples,sr){
  const clean=normalize(removeDC(samples)),duration=samples.length/sr,p=peak(samples),r=rms(samples);
  const track=pitchTrack(clean,sr),periods=extractPeriods(clean,sr),seq=periodSequenceFeatures(periods),voiced=track.filter(x=>x.f0),f0s=voiced.map(x=>x.f0);
  const pf=periodFeatures(periods),af=amplitudeFeatures(periods),periodLevel=periodSequenceFeatures(periods),noise=spectralNoise(clean,sr,mean(f0s)),cpp=spectralCepstrumCPP(clean,sr);
  const clipped=samples.length?samples.filter(x=>Math.abs(x)>=.99).length/samples.length*100:0;
  const voicedPct=track.length?voiced.length/track.length*100:0;
  const quality=Math.max(0,Math.min(100,Math.round(100-0.5*clipped-0.35*Math.max(0,40-voicedPct))));
  const f0Mean=mean(f0s),f0Min=f0s.length?Math.min(...f0s):null,f0Max=f0s.length?Math.max(...f0s):null;
  return {
    sampleRate:sr,durationSec:duration,f0Mean,f0Median:median(f0s),f0Min,f0Max,f0Sd:sd(f0s),
    pfrSemitones:f0Min&&f0Max?12*Math.log2(f0Max/f0Min):null,
    jitaUs:pf.jitaUs,jitterLocalPct:pf.jittPct,jittPct:pf.jittPct,rapPct:pf.rapPct,ppqPct:pf.ppqPct,
    sppqPct:pf.sppqPct,vf0Pct:pf.vf0Pct,t0Ms:pf.t0Ms,
    shimmerLocalPct:af.shimPct,shimPct:af.shimPct,shdB:af.shdB,apqPct:af.apqPct,sapqPct:af.sapqPct,vamPct:af.vamPct,
    nhr:noise.nhr,vti:noise.vti,spi:noise.spi,cppPrototypeDb:cpp,voicedPct,clippedPct:clipped,
    rmsDb:20*Math.log10(Math.max(r,1e-9)),peakDb:20*Math.log10(Math.max(p,1e-9)),
    quality:{score:quality,label:quality>=80?'Good':quality>=60?'Review':'Poor',issues:[...(clipped>1?['Clipping detected']:[]),...(voicedPct<30?['Low voiced-frame proportion']:[]),...(duration<2?['Short recording']:[])]},
    pitchTrack:track,periods,periodLevel,
    measurementStatus:{
      core:'prototype',
      mdvpComparable:['F0','Fhi','Flo','STD','Jita','Jitt','RAP','PPQ','sPPQ','vF0','ShdB','Shim','APQ','sAPQ','vAm','NHR'],
      note:'MDVP-oriented definitions and default smoothing windows are implemented as research targets; equivalence still requires paired empirical validation against the reference software.'
    }
  };
}
function stats(a){const x=a.filter(Number.isFinite);return{n:x.length,mean:mean(x),median:median(x),sd:sd(x),min:x.length?Math.min(...x):NaN,max:x.length?Math.max(...x):NaN}}

function taskSpecificMetrics(samples,sr,task='vowel'){const x=removeDC(samples),duration=x.length/sr,abs=x.map(v=>Math.abs(v)),track=pitchTrack(normalize(x),sr),f0=track.filter(v=>Number.isFinite(v.f0)).map(v=>v.f0),voiced=track.filter(v=>Number.isFinite(v.f0)),intensity=track.map(v=>20*Math.log10(Math.max(v.rms,1e-9))),result={task,durationSec:duration,mptSec:null,pitchRangeSemitones:null,pitchMinHz:null,pitchMaxHz:null,intensityMeanDb:mean(intensity),intensityMinDb:intensity.length?Math.min(...intensity):null,intensityMaxDb:intensity.length?Math.max(...intensity):null,voicedPct:track.length?voiced.length/track.length*100:0};if(f0.length){result.pitchMinHz=Math.min(...f0);result.pitchMaxHz=Math.max(...f0);result.pitchRangeSemitones=12*Math.log2(result.pitchMaxHz/result.pitchMinHz)}if(task==='mpt'||task==='vowel'){const threshold=Math.max(.015,peak(x)*.12);let best=0,run=0;for(const v of abs){if(v>=threshold)run++;else{best=Math.max(best,run);run=0}}best=Math.max(best,run);result.mptSec=best/sr}return result}
function measurementGate(a){const issues=[],status={},checks={duration:a.durationSec>=2,voicing:a.voicedPct>=30,clipping:a.clippedPct<=1,cycles:(a.periods||[]).length>=3};if(!checks.duration)issues.push('Recording shorter than 2 seconds');if(!checks.voicing)issues.push('Insufficient voiced material');if(!checks.clipping)issues.push('Clipping exceeds 1%');if(!checks.cycles)issues.push('Insufficient reliable voice periods');const core=['f0Mean','f0Min','f0Max','f0Sd','jitaUs','jittPct','rapPct','ppqPct','sppqPct','vf0Pct','shdB','shimPct','apqPct','sapqPct','vamPct','nhr'];for(const k of core)status[k]=checks.voicing&&checks.cycles&&Number.isFinite(a[k])?'valid':Number.isFinite(a[k])?'limited':'unavailable';return{overall:issues.length?'limited':'valid',issues,status}}
window.SV_DSP={mean,median,sd,rms,peak,removeDC,normalize,hann,frames,autocorrelationF0,medianFilterSeries,pitchTrack,extractPeriods,periodSequenceFeatures,mdvpPerturbation,periodFeatures,amplitudeFeatures,taskSpecificMetrics,measurementGate,analyzeVoice,analyzeVoiceFast,stats};
})();
window.SV_DSP=window.SV_DSP||{};window.SV_DSP.MDVP_PARAMETER_SPEC=MDVP_PARAMETER_SPEC;window.SV_DSP.VERSION='2026-09-24-dsp-audit-fix2';
