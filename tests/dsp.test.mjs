import test from 'node:test';import assert from 'node:assert/strict';import{removeDC,rms,peak,autocorrelationF0,analyzeVoice,stats}from '../src/dsp.js';
test('DC removal',()=>assert(Math.abs(removeDC([1,2,3]).reduce((a,b)=>a+b,0))<1e-12));
test('RMS/peak',()=>{assert.equal(peak([-2,1]),2);assert.equal(rms([1,1]),1)});
test('F0 100Hz',()=>{const sr=8000,x=Array.from({length:8000},(_,i)=>Math.sin(2*Math.PI*100*i/sr));const f=autocorrelationF0(x,sr);assert(Math.abs(f-100)<2)});
test('analysis output',()=>{const sr=8000,x=Array.from({length:24000},(_,i)=>.2*Math.sin(2*Math.PI*120*i/sr));const r=analyzeVoice(x,sr);assert(r.f0Mean>110&&r.f0Mean<130);assert(r.durationSec===3)});
test('stats',()=>assert.equal(stats([1,2,3]).mean,2));