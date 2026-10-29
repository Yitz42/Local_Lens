import test from 'node:test';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir,access} from 'node:fs/promises';
test('the GitHub Pages build is static and looks up places in the browser',async()=>{
 execFileSync(process.execPath,['scripts/build-pages.mjs']);
 const out=new URL('../dist/pages/',import.meta.url);
 await access(new URL('.nojekyll',out));
 const lookup=await import(new URL('overture-browser.js',out));
 assert.equal(typeof lookup.lookupPlacesPage,'function');
 for(const name of (await readdir(out)).filter(name=>name.endsWith('.html'))){
  const html=await readFile(new URL(name,out),'utf8');
  assert.match(html,/<meta charset="utf-8"><meta name="local-lens-places" content="browser">/i,name);
 }
 const app=await readFile(new URL('app.js',out),'utf8');
 assert.match(app,/import\('\.\/overture-browser\.js/);
});
