import test from "node:test";import assert from "node:assert/strict";
import {summarizeParameter,limitsOfAgreement} from "../src/validation/metrics.js";
import {validateProtocol} from "../src/validation/protocol.js";
import {qaDataset} from "../src/validation/qa.js";
test("validation metrics",()=>{const r=summarizeParameter([100,110,120],[101,109,121]);assert.equal(r.n,3);assert(r.mae>0);assert(Number.isFinite(r.correlation))});
test("LoA",()=>{const r=limitsOfAgreement([1,2,3],[1,2,2]);assert(Number.isFinite(r.lower)&&Number.isFinite(r.upper))});
test("protocol",()=>assert.equal(validateProtocol({referenceTool:"Praat",parameters:["f0"],repetitions:3}).valid,true));
test("dataset QA",()=>{const r=qaDataset([{participant_id:"P1",sample_id:"S1",task:"vowel",reference:{},securavox:{},sample_rate:16000,duration_sec:3,quality:90}]);assert.equal(r.ready,true)});