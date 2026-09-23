import test from 'node:test';
import assert from 'node:assert/strict';
import {sineVoice,runSyntheticBench,runSyntheticBenchmark} from '../src/research/syntheticVoice.js';

test('synthetic constant voice has deterministic ground truth',()=>{
  const v=sineVoice({periods:120,baseF0:120,jitterPct:0,amplitudeVariationPct:0});
  assert.equal(v.groundTruth.theoretical.vf0Pct,0);
  assert.equal(v.groundTruth.theoretical.vamPct,0);
  assert.equal(v.groundTruth.theoretical.rapPct,0);
  assert.equal(v.groundTruth.theoretical.ppqPct,0);
  assert.equal(v.groundTruth.theoretical.sppqPct,0);
  assert.equal(v.groundTruth.theoretical.apqPct,0);
  assert.equal(v.groundTruth.theoretical.sapqPct,0);
});

test('synthetic bench contains four controlled cases',()=>{
  const rows=runSyntheticBench();
  assert.equal(rows.length,4);
  assert(rows.some(x=>x.id==='jitter-120hz'));
  assert(rows.some(x=>x.id==='amplitude-variation'));
  assert(rows.every(x=>Number.isFinite(x.expected.f0Mean)));
});

test('jitter and amplitude perturbation ground truth are nonzero when introduced',()=>{
  const rows=runSyntheticBench();
  const j=rows.find(x=>x.id==='jitter-120hz').expected;
  const a=rows.find(x=>x.id==='amplitude-variation').expected;
  assert(j.jittPct>0 && j.vf0Pct>0);
  assert(a.vamPct>0 && a.apqPct>0);
});

test('automated benchmark returns PASS/FAIL rows',()=>{
  const report=runSyntheticBenchmark();
  assert.equal(report.cases.length,4);
  assert(report.cases.every(r=>r.results.length===10));
  assert(report.cases.every(r=>r.results.every(x=>['PASS','FAIL'].includes(x.status))));
  assert.equal(typeof report.overallPass,'boolean');
});
