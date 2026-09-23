import test from 'node:test';
import assert from 'node:assert/strict';
import {mdvpPerturbation,periodFeatures,amplitudeFeatures,extractPeriods} from '../src/dsp.js';

test('MDVP RAP/PPQ/sPPQ windows use odd centered windows',()=>{
  const v=Array.from({length:55},()=>10);
  assert.equal(mdvpPerturbation(v,3),0);
  assert.equal(mdvpPerturbation(v,5),0);
  assert.equal(mdvpPerturbation(v,55),0);
});

test('MDVP vF0 uses relative full-sample F0 SD',()=>{
  const track=[100,100,100,100].map(f0=>({f0,rms:1}));
  const p=periodFeatures(track);
  assert.equal(p.vf0Pct,0);
});

test('MDVP vAm is zero for constant amplitude',()=>{
  const track=Array.from({length:12},()=>({f0:100,rms:2}));
  assert.equal(amplitudeFeatures(track).vamPct,0);
  assert.equal(amplitudeFeatures(track).apqPct,0);
});

test('MDVP amplitude hierarchy exposes APQ 11 and sAPQ 55 windows',()=>{
  const track=Array.from({length:60},(_,i)=>({f0:100,rms:2+(i===30?0.2:0)}));
  const a=amplitudeFeatures(track);
  assert(Number.isFinite(a.apqPct));
  assert(Number.isFinite(a.sapqPct));
});


test('period extraction exposes period-level records',()=>{const sr=8000,x=Array.from({length:24000},(_,i)=>.2*Math.sin(2*Math.PI*120*i/sr));const p=extractPeriods(x,sr);assert(p.length>20);assert(p.every(q=>q.periodSec>0&&q.f0>0&&q.peakToPeak>0));});
