import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateFirms} from '../scripts/build-firms.mjs';
import {FIRM_CATALOG} from '../public/pe-firm-directory.js';
import {BRAND_DIRECTORY} from '../public/brand-directory.js';
import {createWorker} from '../worker/index.js';

test('firm research, generated holdings, and brand affiliations stay linked',async()=>{
 const source=validateFirms(JSON.parse(await readFile(new URL('../data/pe-firms.json',import.meta.url),'utf8')));
 const published=JSON.parse(await readFile(new URL('../public/pe-firms.json',import.meta.url),'utf8'));
 assert.deepEqual(published,FIRM_CATALOG);assert.equal(source.firms.length,published.firmCount);
 const names=new Set(published.firms.map(firm=>firm.firm));
 for(const brand of BRAND_DIRECTORY)for(const sponsor of brand.sponsors||[])assert.ok(names.has(sponsor),sponsor);
 for(const firm of published.firms){
  assert.deepEqual(firm.mappedBrands.map(brand=>brand.brand),BRAND_DIRECTORY.filter(brand=>brand.sponsors?.includes(firm.firm)).map(brand=>brand.brand));
  if(firm.status==='not_reviewed')assert.equal(firm.holdings.length,0);
 }
 const tsg=published.firms.find(firm=>firm.firm==='TSG Consumer Partners');
 assert.ok(tsg.holdings.some(holding=>holding.company==='Crumbl'));
 assert.ok(tsg.mappedBrands.some(brand=>brand.brand==='Crumbl'));
 const sentinel=published.firms.find(firm=>firm.firm==='Sentinel Capital Partners');
 assert.equal(sentinel.status,'partial');assert.ok(!sentinel.holdings.some(holding=>holding.company==='Chemical Guys'));
});
test('an unreviewed firm cannot acquire holdings without evidence',()=>{
 const pending=FIRM_CATALOG.firms.find(firm=>firm.status==='not_reviewed');
 const dataset=firms=>({version:1,firms});
 assert.throws(()=>validateFirms(dataset([{...pending,status:'reviewed',source:null}])),/evidence/);
 assert.throws(()=>validateFirms(dataset([{...pending,holdings:[{company:'Unverified'}]}])),/Unreviewed holdings/);
 assert.throws(()=>validateFirms(dataset([pending,pending])),/duplicate/);
});
test('adding firm evidence preserves the review dates of earlier holdings',async()=>{
 const lgp=FIRM_CATALOG.firms.find(firm=>firm.firm==='Leonard Green & Partners');
 const earlier=lgp.holdings.find(holding=>holding.checked&&holding.checked<lgp.checked);
 assert.ok(earlier,'Earlier holding date remains recorded');
 const csv=await readFile(new URL('../public/pe-holdings.csv',import.meta.url),'utf8');
 const row=csv.split('\r\n').find(line=>line.startsWith('"Leonard Green & Partners","'+earlier.company+'",'));
 assert.ok(row.endsWith('"'+earlier.checked+'"'));
});
test('firm downloads have fresh responses and correct data formats',async()=>{
 const worker=createWorker({'/pe-firms.json':'{"firms":[]}','/pe-holdings.csv':'firm,company\r\nExample,Brand\r\n'});
 for(const [path,type] of [['/pe-firms.json','application/json'],['/pe-holdings.csv','text/csv']]){
  const response=await worker.fetch(new Request('https://local.test'+path));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-cache');assert.ok(response.headers.get('content-type').startsWith(type));
 }
});
