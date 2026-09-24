/* PhonaCore-ASLP analysis worker */
importScripts('./public/dsp.js?build=20260924-dsp-audit-fix4');
self.onmessage=function(e){
  try{
    const d=e.data||{};
    const pcm=new Float32Array(d.buffer);
    const analysis=self.SV_DSP.analyzeVoiceFast(pcm,d.sr,d.task||'vowel');
    analysis.task=d.task||'vowel';
    analysis.taskMetrics=self.SV_DSP.taskSpecificMetrics(pcm,d.sr,d.task||'vowel');
    analysis.measurementStatus.gate=self.SV_DSP.measurementGate(analysis);
    analysis.recordingMeta={sampleRate:d.sr,channels:1,duration:d.duration,codec:'PCM/Web Audio'};
    self.postMessage({ok:true,analysis});
  }catch(err){
    self.postMessage({ok:false,error:String(err&&err.message||err)});
  }
};