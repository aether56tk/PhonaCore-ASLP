import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const port=Number(process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
  let u;
  try{u=new URL(req.url,'http://localhost')}catch{res.writeHead(400);return res.end('Bad request')}
  let rel=decodeURIComponent(u.pathname); if(rel==='/'||rel==='') rel='/index.html';
  const file=path.normalize(path.join(root,rel));
  if(!file.startsWith(root)) {res.writeHead(403);return res.end('Forbidden')}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);return res.end('Not found')}
    const ext=path.extname(file); const body=fs.readFileSync(file);
    const etag='"'+createHash('sha1').update(body).digest('hex')+'"';
    if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end()}
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Content-Length':body.length,'ETag':etag,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'microphone=(self),camera=(self),geolocation=()','Content-Security-Policy':"default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'"});
    res.end(body);
  });
});
server.listen(port,()=>console.log(`PhonaCore-ASLP running at http://localhost:${port}`));