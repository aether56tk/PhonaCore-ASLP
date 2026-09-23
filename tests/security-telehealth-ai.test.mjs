import test from "node:test";import assert from "node:assert/strict";
import {createSecureSession,grantConsent,revokeConsent,transition} from "../src/telehealth/secureSession.js";
import {can,auditEvent,sanitizeAuditMetadata} from "../src/security/securityCore.js";
import {reviewMeasurements,compareSessions} from "../src/ai/reviewEngine.js";
test("telehealth consent lifecycle",()=>{let s=createSecureSession({patientId:"P1",clinicianId:"C1",consentScope:["voice"]});s=grantConsent(s);assert.equal(s.state,"ready");s=transition(s,"active");assert.equal(s.state,"active");s=revokeConsent(s);assert.equal(s.state,"cancelled")});
test("RBAC and audit",()=>{assert(can("CLINICIAN","read"));assert(!can("PATIENT","manage-users"));const e=auditEvent("C1","read","P1",{token:"secret",purpose:"care"});assert.equal(e.metadata.token,"secret");assert.equal(sanitizeAuditMetadata(e.metadata).token,undefined)});
test("AI gives advisory flags only",()=>{const r=reviewMeasurements({qualityScore:40,clippingPercent:2,voicedPercent:20});assert.equal(r.diagnostic,false);assert(r.flags.length>=2)});
test("longitudinal comparison is descriptive",()=>{const r=compareSessions({f0Mean:100},{f0Mean:110});assert.equal(r.type,"descriptive-longitudinal");assert.equal(r.changes.f0Mean.absolute,10)});