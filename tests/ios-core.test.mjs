import test from 'node:test';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
// JavaScriptCore has no fetch, timers, or TextDecoder, so the iOS bundle runs in an empty context here.
test('the iOS core bundle runs without browser APIs',async()=>{
 execFileSync(process.execPath,['scripts/build-ios-core.mjs']);
 const context=vm.createContext({});context.globalThis=context;
 const ranges=[];
 // A failing archive read must reach the load error callback.
 context.__nativeGetBytes=(url,offset,length,resolve,reject)=>{ranges.push([url,offset,length]);reject('offline');};
 vm.runInContext(await readFile(new URL('../dist/ios/local-lens-core.js',import.meta.url),'utf8'),context);
 const core=context.LocalLensCore,info=JSON.parse(core.info());
 assert.match(info.release,/^\d{4}-\d{2}-\d{2}\.\d+$/);
 assert.ok(info.categories.some(c=>c.id==='restaurant'));
 assert.deepEqual(info.defaultHidden,['pe','corporate']);
 const brands=JSON.parse(core.brands('starbucks','all'));
 assert.equal(brands[0].brand,'Starbucks');
 assert.deepEqual(JSON.parse(core.filter(JSON.stringify({origin:{lat:39.29,lng:-76.61},radius:1609,hidden:[]}))),[]);
 const error=await new Promise(resolve=>core.load(39.29,-76.61,1609,()=>{},()=>resolve(null),resolve));
 assert.match(error,/offline/);
 assert.match(ranges[0][0],/overturemaps.*places\.pmtiles$/);
});
