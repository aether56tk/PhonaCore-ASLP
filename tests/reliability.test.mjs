import test from 'node:test';
import assert from 'node:assert/strict';
import {agreementStats,icc31,testRetest,conditionReliability} from '../src/research/reliability.js';

test('agreement statistics calculate paired difference metrics',()=>{
  const r=agreementStats([[10,11],[12,12],[14,15]]);
  assert.equal(r.n,3);
  assert.equal(r.bias,2/3);
  assert.equal(r.mae,2/3);
  assert.equal(r.rmse,Math.sqrt(2/3));
  assert.equal(r.loa95.length,2);
});

test('ICC(3,1) is 1 for identical repeated measurements',()=>{
  const r=icc31([[10,10],[12,12],[14,14],[16,16]]);
  assert.equal(r.n,4);
  assert.equal(r.k,2);
  assert.equal(r.icc31,1);
});

test('test-retest pairs by subject and session rather than row order',()=>{
  const r=testRetest([
    {subject_id:'S2',session_id:'T2',f0Mean:121},
    {subject_id:'S1',session_id:'T1',f0Mean:120},
    {subject_id:'S2',session_id:'T1',f0Mean:120},
    {subject_id:'S1',session_id:'T2',f0Mean:119},
    {subject_id:'S3',session_id:'T1',f0Mean:130}
  ]);
  assert.equal(r.n,2);
  assert.deepEqual(r.pairs.map(x=>x.id),['S2','S1']);
  assert.equal(r.icc.n,2);
});

test('condition reliability pairs device/browser conditions',()=>{
  const r=conditionReliability([
    {subject_id:'S1',condition:'A',f0Mean:120},
    {subject_id:'S1',condition:'B',f0Mean:121},
    {subject_id:'S2',condition:'A',f0Mean:130},
    {subject_id:'S2',condition:'B',f0Mean:129}
  ],{parameter:'f0Mean',a:'A',b:'B'});
  assert.equal(r.agreement.n,2);
  assert.equal(r.agreement.bias,0);
});
