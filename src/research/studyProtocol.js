export const STANDARD_PROTOCOL={version:'1.0',task:'sustained /a/',durationSec:{min:5,target:6,max:10},sampleRateHz:[16000,44100,48000],channels:1,microphoneDistanceCm:15,angleDegrees:45,environment:'quiet room',preprocessing:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},analysisWindow:'central stable voiced segment',pairedAnalysis:'identical WAV file for PhonaCore-ASLP and reference analysis',exclusion:['clipping','insufficient duration','excessive background noise','insufficient voiced material','unreliable period extraction']};

export function createRecordingManifest(input={}){
  return {protocolVersion:STANDARD_PROTOCOL.version,studyId:input.studyId||'PHONACORE-VAL',sampleId:input.sampleId||'',participantCode:input.participantCode||'',task:input.task||STANDARD_PROTOCOL.task,createdAt:input.createdAt||new Date().toISOString(),sampleRateHz:input.sampleRateHz||null,channels:input.channels??null,durationSec:input.durationSec??null,microphoneDistanceCm:input.microphoneDistanceCm??STANDARD_PROTOCOL.microphoneDistanceCm,angleDegrees:input.angleDegrees??STANDARD_PROTOCOL.angleDegrees,device:input.device||'',browser:input.browser||'',preprocessing:input.preprocessing||STANDARD_PROTOCOL.preprocessing,notes:input.notes||''};
}

export function protocolCheck(m={}){
  const issues=[];
  if(!m.sampleId)issues.push('Missing sample_id');
  if(!m.participantCode)issues.push('Missing participant_code');
  if(m.channels!==null&&m.channels!==1)issues.push('Recording is not mono');
  if(Number.isFinite(m.durationSec)&&(m.durationSec<STANDARD_PROTOCOL.durationSec.min||m.durationSec>STANDARD_PROTOCOL.durationSec.max))issues.push('Duration outside protocol range');
  if(Number.isFinite(m.sampleRateHz)&&!STANDARD_PROTOCOL.sampleRateHz.includes(m.sampleRateHz))issues.push('Sample rate is outside the standard protocol options');
  if(m.preprocessing){
    for(const [key,expected] of Object.entries(STANDARD_PROTOCOL.preprocessing)){
      if(m.preprocessing[key]!==undefined&&m.preprocessing[key]!==expected)issues.push('Browser preprocessing mismatch: '+key);
    }
  }
  return {valid:issues.length===0,issues};
}

export function pairBySampleId(phona,reference){
  const p=new Map(phona.map(x=>[String(x.sample_id),x]));
  return reference.map(r=>{const id=String(r.sample_id);return{id,phona:p.get(id)||null,reference:r,matched:Boolean(p.get(id))}}); 
}
