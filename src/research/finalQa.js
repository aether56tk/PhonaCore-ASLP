export const FINAL_QA_CHECKS=[
 ['algorithmValidation','Algorithm validation completed and passed'],
 ['studyProtocol','Standardized study protocol defined'],
 ['humanData','Human recording dataset reviewed'],
 ['referencePairs','Reference-system paired validation available'],
 ['reliability','Test–retest/device reliability analyzed'],
 ['integrity','Dataset hashes/manifests available'],
 ['publication','Publication results package generated']
];
export function evaluateFinalQa(state={}){
 const checks=FINAL_QA_CHECKS.map(([id,label])=>{
  let pass=false;
  if(id==='algorithmValidation')pass=Boolean(state.algorithmValidation?.overallPass);
  if(id==='studyProtocol')pass=Boolean(state.studyManifest?.protocolVersion||state.protocolVersion);
  if(id==='humanData')pass=Array.isArray(state.batchResults)&&state.batchResults.length>0&&state.batchResults.every(x=>x.protocolStatus!=='FAIL');
  if(id==='referencePairs')pass=Boolean(state.validationReport?.matched>0||state.validityReport?.results?.n>0);
  if(id==='reliability')pass=Boolean(state.reliabilityReport?.testRetest?.n>0||state.reliabilityReport?.condition?.n>0);
  if(id==='integrity')pass=Array.isArray(state.batchResults)&&state.batchResults.length>0&&state.batchResults.every(x=>typeof x.sha256==='string'&&x.sha256.length===64);
  if(id==='publication')pass=Boolean(state.publicationPackage);
  return{id,label,pass};
 });
 return {schemaVersion:'1.0',generatedAt:new Date().toISOString(),checks,passed:checks.filter(x=>x.pass).length,total:checks.length,ready:checks.every(x=>x.pass),limitations:['A software QA gate cannot establish clinical validity. Human-study claims require appropriate study design, sample size, reference procedures, and statistical analysis.','The final gate depends on the actual study data supplied by the researcher.']};
}
