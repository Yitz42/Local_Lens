import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BRAND_DIRECTORY} from '../public/brand-directory.js';
import {ownershipFor,filterPlaces} from '../public/ownership.js';
import {searchBrands} from '../public/directory-utils.js';
import {validateDirectory} from '../scripts/build-directory.mjs';
import {createWorker} from '../worker/index.js';

const origin={lat:30.2747,lng:-97.7523};
test('the published list, matcher, and downloads cover the same reviewed brands',async()=>{
 const source=validateDirectory(JSON.parse(await readFile(new URL('../data/brands.json',import.meta.url),'utf8')));
 const download=JSON.parse(await readFile(new URL('../public/brands.json',import.meta.url),'utf8'));
 const listed=BRAND_DIRECTORY.filter(brand=>brand.type!=='independent');
 assert.ok(listed.length>150,'Substantially expanded directory expected');
 assert.equal(source.brands.length,BRAND_DIRECTORY.length);
 assert.deepEqual([...source.brands].sort((a,b)=>a.brand.localeCompare(b.brand,'en')),BRAND_DIRECTORY);
 assert.deepEqual(download.brands,listed);
 for(const brand of listed){
  const place={...origin,id:brand.brand,name:brand.brand,category:brand.matchCategories?.[0]||'restaurant'};
  assert.equal(ownershipFor(place).type,brand.type,brand.brand);
  assert.equal(ownershipFor(place).parent,brand.parent,brand.brand);
  assert.equal(filterPlaces([place],{origin,hidden:[brand.type]}).length,0,brand.brand);
 }
 const csv=await readFile(new URL('../public/brands.csv',import.meta.url),'utf8');
 assert.equal(csv.trim().split('\r\n').length,listed.length+1);
});
test('brand search supports parents, aliases, ownership categories, and accents',()=>{
 const cvs=searchBrands(BRAND_DIRECTORY,{query:'CVS/pharmacy'});
 assert.ok(cvs.some(brand=>brand.parent==='CVS Health Corporation'));
 assert.ok(searchBrands(BRAND_DIRECTORY,{query:'Roark',type:'pe'}).length>10);
 assert.equal(searchBrands(BRAND_DIRECTORY,{query:'Roark',type:'corporate'}).length,0);
 assert.ok(searchBrands(BRAND_DIRECTORY,{query:'Einstein’s'}).some(brand=>brand.brand==='Einstein Bros. Bagels'));
 assert.equal(searchBrands(BRAND_DIRECTORY,{query:'Wheatsville'}).length,0);
 assert.equal(searchBrands(BRAND_DIRECTORY,{query:'NoSuchBrand12345'}).length,0);
});
test('the directory rejects missing evidence and ambiguous brand aliases',()=>{
 const row=BRAND_DIRECTORY.find(brand=>brand.type==='corporate');
 const dataset=brands=>({version:1,brands});
 assert.throws(()=>validateDirectory(dataset([{...row,source:''}])) ,/source/);
 assert.throws(()=>validateDirectory(dataset([{...row,source:'http://example.com'}])),/HTTPS/);
 assert.throws(()=>validateDirectory(dataset([{...row,checked:'yesterday'}])),/review date/);
 assert.throws(()=>validateDirectory(dataset([row,{...row,brand:'Different company',aliases:[row.brand]}])),/Ambiguous alias/);
});
test('ambiguous grocery and retail names need category or explicit brand context',()=>{
 const place={...origin,name:'ACME',category:'restaurant'};
 assert.equal(ownershipFor(place).type,'unknown');
 assert.equal(ownershipFor({...place,category:'grocery'}).type,'corporate');
 assert.equal(ownershipFor({...place,name:'Downtown store',brand:'ACME'}).type,'corporate');
 assert.equal(ownershipFor({...place,name:'Sierra'}).type,'unknown');
 assert.equal(ownershipFor({...place,name:'Subway',brand:'CVS Pharmacy'}).parent,'CVS Health Corporation');
});
test('ownership downloads refresh with the directory and have correct content types',async()=>{
 const worker=createWorker({'/brands.csv':'brand,type\nCVS,corporate','/brands.json':'{"brands":[]}'});
 for(const [path,type] of [['/brands.csv','text/csv'],['/brands.json','application/json']]){
  const response=await worker.fetch(new Request('https://local.test'+path));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-cache');
  assert.ok(response.headers.get('content-type').startsWith(type));
 }
});
test('reviewed ownership changes and unrelated chain names stay distinct',()=>{
 const place=name=>({...origin,name,category:'other'});
 assert.match(ownershipFor(place('Nothing Bundt Cakes')).parent,/KKR/);
 assert.equal(ownershipFor(place('Walgreens')).type,'pe');
 assert.match(ownershipFor({...place('The Fresh Market'),category:'grocery'}).parent,/Cencosud/);
 assert.equal(ownershipFor(place('What-A-Burger')).type,'unknown');
 assert.equal(ownershipFor(place('Take 5')).type,'unknown');
});
