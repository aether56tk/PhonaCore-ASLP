import test from 'node:test';
import assert from 'node:assert/strict';
import {STANDARD_PROTOCOL,createRecordingManifest,protocolCheck,pairBySampleId} from '../src/research/studyProtocol.js';

test('standard protocol is mono and disables browser processing',()=>{
  assert.equal(STANDARD_PROTOCOL.channels,1);
  assert.equal(STANDARD_PROTOCOL.preprocessing.echoCancellation,false);
  assert.equal(STANDARD_PROTOCOL.preprocessing.noiseSuppression,false);
  assert.equal(STANDARD_PROTOCOL.preprocessing.autoGainControl,false);
});

test('recording manifest contains reproducibility metadata',()=>{
  const m=createRecordingManifest({sampleId:'S001',participantCode:'P001',sampleRateHz:16000,channels:1,durationSec:6});
  assert.equal(m.sampleId,'S001');
  assert.equal(m.participantCode,'P001');
  assert.equal(m.channels,1);
  assert.equal(protocolCheck(m).valid,true);
});

test('protocol rejects missing identifiers and non-mono audio',()=>{
  const r=protocolCheck({sampleId:'',participantCode:'',channels:2,durationSec:6});
  assert.equal(r.valid,false);
  assert(r.issues.includes('Missing sample_id'));
  assert(r.issues.includes('Recording is not mono'));
});

test('pairing uses sample_id without positional assumptions',()=>{
  const out=pairBySampleId([{sample_id:'B',f0Mean:120},{sample_id:'A',f0Mean:110}],[{sample_id:'A',F0:111},{sample_id:'C',F0:130}]);
  assert.equal(out[0].matched,true);
  assert.equal(out[0].phona.f0Mean,110);
  assert.equal(out[1].matched,false);
});


test('protocol rejects unsupported sample rate and browser preprocessing',()=>{
  const r=protocolCheck({sampleId:'S001',participantCode:'P001',channels:1,durationSec:6,sampleRateHz:22050,preprocessing:{echoCancellation:true,noiseSuppression:false,autoGainControl:false}});
  assert.equal(r.valid,false);
  assert(r.issues.some(x=>x.includes('Sample rate')));
  assert(r.issues.some(x=>x.includes('echoCancellation')));
});
