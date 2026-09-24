// PhonaCore-ASLP analysis worker: keeps acoustic DSP off the main UI thread.
self.window=self;
importScripts('./dsp.js?build=20260924-dsp-accuracy-ux34');
self.onmessage=function(e){
  try{
    const d=e.data||{};
    const pcm=new Float32Array(d.buffer);
    const sr=Number(d.sr)||44100;
    const task=d.task||'vowel';
    const a=self.SV_DSP.analyzeVoiceFast(pcm,sr,task);
    a.task=task;
    a.taskMetrics=self.SV_DSP.taskSpecificMetrics(pcm,sr,task);
    a.measurementStatus.gate=self.SV_DSP.measurementGate(a);
    a.recordingMeta={sampleRate:sr,channels:1,duration:Number(d.duration)||pcm.length/sr,codec:'PCM/Web Audio'};
    self.postMessage({ok:true,analysis:a});
  }catch(err){
    self.postMessage({ok:false,error:err&&err.message?err.message:String(err)});
  }
};
