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
 * MDVP-oriented perturbation helper.
 * For odd windows (3/5/11/55), compare each center value with the
 * moving-average value across the full window, then average the
 * absolute relative deviation over valid centers.
 */
export function mdvpPerturbation(values,window){
  if(!Array.isArray(values)||values.length<window||window<3||window%2===0)return null;
  const half=Math.floor(window/2),out=[];
  for(let i=half;i<values.length-half;i++){
    const w=values.slice(i-half,i+half+1),local=mean(w);
    if(Number.isFinite(local)&&local!==0&&Number.isFinite(values[i]))out.push(Math.abs(values[i]-local)/Math.abs(local));
  }
  return out.length?100*mean(out):null;
}

export function periodFeatures(track){
  const periods=track.filter(x=>x.f0&&x.f0>0).map(x=>1/x.f0);
  if(periods.length<3)return {periods,jitaUs:null,jittPct:null,rapPct:null,ppqPct:null,sppqPct:null,vf0Pct:null,t0Ms:null};
  const diffs=[];for(let i=1;i<periods.length;i++)diffs.push(Math.abs(periods[i]-periods[i-1]));
  const av=mean(periods),f0s=periods.map(p=>1/p);
  return {
    periods,
    jitaUs:mean(diffs)*1e6,
    jittPct:100*mean(diffs)/av,
    rapPct:mdvpPerturbation(periods,3),
    ppqPct:mdvpPerturbation(periods,5),
    sppqPct:mdvpPerturbation(periods,55),
    vf0Pct:100*sd(f0s)/mean(f0s),
    t0Ms:av*1000
  };
}

export function amplitudeFeatures(track){
  const a=track.filter(x=>x.f0&&x.rms>0).map(x=>x.rms);
  if(a.length<3)return {shimPct:null,shdB:null,apqPct:null,sapqPct:null,vamPct:null};
  const ratios=[],db=[];
  for(let i=1;i<a.length;i++){
    ratios.push(Math.abs(a[i]-a[i-1])/((a[i]+a[i-1])/2));
    db.push(Math.abs(20*Math.log10(a[i]/a[i-1])));
  }
  return {
    shimPct:100*mean(ratios),
    shdB:mean(db),
    apqPct:mdvpPerturbation(a,11),
    sapqPct:mdvpPerturbation(a,55),
    vamPct:100*sd(a)/mean(a)
  };
}

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

export function analyzeVoice(samples,sr){
  const clean=normalize(removeDC(samples)),duration=samples.length/sr,p=peak(samples),r=rms(samples);
  const track=pitchTrack(clean,sr),voiced=track.filter(x=>x.f0),f0s=voiced.map(x=>x.f0);
  const pf=periodFeatures(track),af=amplitudeFeatures(track),noise=spectralNoise(clean,sr,mean(f0s)),cpp=spectralCepstrumCPP(clean,sr);
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
    pitchTrack:track,
    measurementStatus:{
      core:'prototype',
      mdvpComparable:['F0','Fhi','Flo','STD','Jita','Jitt','RAP','PPQ','sPPQ','vF0','ShdB','Shim','APQ','sAPQ','vAm','NHR'],
      note:'MDVP-oriented definitions and default smoothing windows are implemented as research targets; equivalence still requires paired empirical validation against the reference software.'
    }
  };
}
export function stats(a){const x=a.filter(Number.isFinite);return{n:x.length,mean:mean(x),median:median(x),sd:sd(x),min:x.length?Math.min(...x):NaN,max:x.length?Math.max(...x):NaN}}
