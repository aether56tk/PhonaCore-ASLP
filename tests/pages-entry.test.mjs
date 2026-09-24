import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=path.join(root,'public');

function cleanSrc(src){return src.split('?')[0].split('#')[0];}

test('GitHub Pages entry references existing JavaScript files with valid syntax',()=>{
  const index=fs.readFileSync(path.join(site,'index.html'),'utf8');
  const scripts=[...index.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>cleanSrc(m[1])).filter(Boolean);
  assert.ok(scripts.length>0,'public/index.html must load at least one script');
  for(const rel of scripts){
    const file=path.resolve(site,rel.replace(/^\.\//,''));
    assert.ok(file.startsWith(site+path.sep),'script path escapes public directory');
    assert.ok(fs.existsSync(file),`missing deployed script: ${rel}`);
    if(file.endsWith('.js')){
      const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
      assert.equal(check.status,0,`syntax error in deployed script ${rel}: ${check.stderr||check.stdout}`);
    }
  }
});

test('deployed application worker reference resolves',()=>{
  const appSrc=[...fs.readdirSync(site)].filter(x=>/^app-v.*\.js$/.test(x)).sort().at(-1);
  assert.ok(appSrc,'versioned application bundle is missing');
  const app=fs.readFileSync(path.join(site,appSrc),'utf8');
  const match=app.match(/new Worker\(['"]([^'"]+)['"]/);
  assert.ok(match,'application must declare its analysis worker');
  const worker=cleanSrc(match[1]);
  const file=path.resolve(site,worker.replace(/^\.\//,''));
  assert.ok(file.startsWith(site+path.sep),'worker path escapes public directory');
  assert.ok(fs.existsSync(file),`missing analysis worker: ${worker}`);
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  assert.equal(check.status,0,`syntax error in analysis worker: ${check.stderr||check.stdout}`);
});
