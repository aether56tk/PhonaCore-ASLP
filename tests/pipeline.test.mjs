import test from "node:test";import assert from "node:assert/strict";
import {rowsToCSV,parseCSV} from "../src/research/csvValidation.js";
import {createManifest} from "../src/research/reproducibilityManifest.js";
import {createConsentRecord,grantConsent,revokeConsent} from "../src/clinical/dataGovernance.js";
import {prepareValidationRun} from "../src/research/workflow.js";
test("CSV round trip",()=>{const rows=[{participant_id:"P1",sample_id:"S1",task:"vowel",sample_rate:16000}];const out=parseCSV(rowsToCSV(rows));assert.equal(out[0].participant_id,"P1")});
test("manifest",()=>assert.equal(createManifest({protocolVersion:"1",appVersion:"5",parameters:["f0"]}).schema,"SVX-MANIFEST-1.0"));
test("consent lifecycle",()=>{let c=createConsentRecord({participantId:"P1",purpose:"research",version:"1"});c=grantConsent(c);assert.equal(c.status,"granted");c=revokeConsent(c);assert.equal(c.status,"revoked")});
test("validation workflow",()=>{const r=prepareValidationRun([{participant_id:"P1",sample_id:"S1",task:"vowel",sample_rate:16000,duration_sec:3,quality:90,reference:{f0:100},securavox:{f0:101}}]);assert.equal(r.ready,true);assert.equal(r.report.parameters.f0.n,1)});