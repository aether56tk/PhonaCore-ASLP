export function numeric(v){const n=Number(v);return Number.isFinite(n)?n:null}

export function pairConditions(rows,{id='subject_id',condition='condition',a='A',b='B',parameter='f0Mean'}={}){
  const groups=new Map();
  for(const row of rows){
    const key=String(row[id]??'');
    const c=String(row[condition]??'');
    const v=numeric(row[parameter]);
    if(!key||v===null)continue;
    if(!groups.has(key))groups.set(key,{id:key});
    if(c===a)groups.get(key).a=v;
    if(c===b)groups.get(key).b=v;
  }
  return [...groups.values()].filter(x=>x.a!==undefined&&x.b!==undefined);
}

export function agreementStats(pairs){
  const p=pairs.map(x=>Array.isArray(x)?x:[x.a,x.b]).map(x=>[numeric(x[0]),numeric(x[1])]).filter(x=>x[0]!==null&&x[1]!==null);
  const n=p.length;
  if(!n)return {n:0,bias:null,mae:null,rmse:null,loa95:null,meanReference:null,meanObserved:null};
  const d=p.map(x=>x[1]-x[0]),bias=d.reduce((s,x)=>s+x,0)/n;
  const mae=d.reduce((s,x)=>s+Math.abs(x),0)/n;
  const rmse=Math.sqrt(d.reduce((s,x)=>s+x*x,0)/n);
  const sd=n>1?Math.sqrt(d.reduce((s,x)=>s+(x-bias)**2,0)/(n-1)):0;
  return {n,bias,mae,rmse,loa95:[bias-1.96*sd,bias+1.96*sd],meanReference:p.reduce((s,x)=>s+x[0],0)/n,meanObserved:p.reduce((s,x)=>s+x[1],0)/n};
}

export function icc31(matrix){
  const rows=matrix.filter(r=>r.length>=2&&r.every(v=>numeric(v)!==null)).map(r=>r.map(numeric));
  const n=rows.length,k=rows[0]?.length||0;
  if(n<2||k<2)return {n,k,icc31:null,msSubject:null,msError:null};
  const grand=rows.flat().reduce((s,x)=>s+x,0)/(n*k);
  const means=rows.map(r=>r.reduce((s,x)=>s+x,0)/k);
  const colMeans=Array.from({length:k},(_,j)=>rows.reduce((s,r)=>s+r[j],0)/n);
  const ssSubject=k*means.reduce((s,m)=>s+(m-grand)**2,0);
  const ssError=rows.reduce((s,r,i)=>s+r.reduce((z,x,j)=>z+(x-means[i]-colMeans[j]+grand)**2,0),0);
  const msSubject=ssSubject/(n-1);
  const msError=ssError/((n-1)*(k-1));
  const icc=(msSubject-msError)/(msSubject+(k-1)*msError);
  return {n,k,icc31,msSubject,msError,grandMean:grand};
}

export function testRetest(rows,{id='subject_id',session='session_id',parameter='f0Mean',first='T1',second='T2'}={}){
  const groups=new Map();
  for(const row of rows){
    const key=String(row[id]??'');
    const s=String(row[session]??'');
    const v=numeric(row[parameter]);
    if(!key||v===null)continue;
    if(!groups.has(key))groups.set(key,{id:key});
    if(s===first)groups.get(key).a=v;
    if(s===second)groups.get(key).b=v;
  }
  const pairs=[...groups.values()].filter(x=>x.a!==undefined&&x.b!==undefined);
  return {parameter,n:pairs.length,pairs,agreement:agreementStats(pairs),icc:icc31(pairs.map(x=>[x.a,x.b]))};
}

export function conditionReliability(rows,opts={}){
  const pairs=pairConditions(rows,opts);
  return {parameter:opts.parameter||'f0Mean',conditionA:opts.a||'A',conditionB:opts.b||'B',pairs,agreement:agreementStats(pairs)};
}
