import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const app=fs.readFileSync(path.join(root,'public','app-v20260924-uiux1.js'),'utf8');

test('role-selection controls are wired',()=>{
  for(const id of ['chooseClinician','choosePatient','switchRole']) {
    assert.match(app,new RegExp("on\\('"+id+"','click'"));
  }
});

test('clinician assessment controls are wired',()=>{
  for(const id of ['saveParticipant','patientAssess','saveClinical','continueVoiceLab','saveSession']) {
    assert.match(app,new RegExp("on\\('"+id+"','click'"));
  }
});

test('patient workflow controls are wired',()=>{
  for(const id of ['saveSelfProfile','scoreHygiene','task','exportJSON']) {
    assert.match(app,new RegExp("on\\('"+id+"','(?:click|change)'"));
  }
});

test('voice worker path and deployed entry agree',()=>{
  const index=fs.readFileSync(path.join(root,'public','index.html'),'utf8');
  assert.match(index,/app-v20260924-uiux1\.js\?build=20260924-uiux4/);
  assert.match(app,/new Worker\('\.\/analysis-worker\.js\?build=20260924-worker-fix1'\)/);
});
