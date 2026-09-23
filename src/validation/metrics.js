export function paired(a,b){const x=[],y=[];for(let i=0;i<Math.min(a?.length||0,b?.length||0);i++){const xv=Number(a[i]),yv=Number(b[i]);if(Number.isFinite(xv)&&Number.isFinite(yv)){x.push(xv);y.push(yv)}}return {x,y,n:x.length}}
export function mean(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN}
export function mae(a,b){const p=paired(a,b);return p.n?mean(p.x.map((v,i)=>Math.abs(v-p.y[i]))):NaN}
export function rmse(a,b){const p=paired(a,b);return p.n?Math.sqrt(mean(p.x.map((v,i)=>(v-p.y[i])**2))):NaN}
export function bias(a,b){const p=paired(a,b);return p.n?mean(p.x.map((v,i)=>v-p.y[i])):NaN}
export function correlation(a,b){const p=paired(a,b);if(p.n<2)return NaN;const mx=mean(p.x),my=mean(p.y);let num=0,dx=0,dy=0;for(let i=0;i<p.n;i++){const X=p.x[i]-mx,Y=p.y[i]-my;num+=X*Y;dx+=X*X;dy+=Y*Y}return dx&&dy?num/Math.sqrt(dx*dy):NaN}
export function limitsOfAgreement(a,b){const p=paired(a,b);if(!p.n)return {bias:NaN,lower:NaN,upper:NaN};const d=p.x.map((v,i)=>v-p.y[i]),m=mean(d),sd=Math.sqrt(mean(d.map(v=>(v-m)**2)));return {bias:m,lower:m-1.96*sd,upper:m+1.96*sd}}
export function summarizeParameter(reference,measured){const p=paired(measured,reference);return {n:p.n,mae:mae(measured,reference),rmse:rmse(measured,reference),bias:bias(measured,reference),correlation:correlation(measured,reference),limitsOfAgreement:limitsOfAgreement(measured,reference)}}