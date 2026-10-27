import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BRAND_DIRECTORY} from '../public/brand-directory.js';
import {ownershipFor,filterPlaces} from '../public/ownership.js';
import {excludedBrandNameMatch,hiddenNameMatch} from '../public/name-filters.js';
import {validateDirectory} from '../scripts/build-directory.mjs';
import {boundsOverlap,inUSCoverage} from '../public/brand-scope.js';

const place=(name,lat,lng,category='grocery')=>({id:name,name,lat,lng,category});
test('unrelated Food City chains use different regional parents in ownership and automatic name filtering',()=>{
 const arizona=place('Food City',33.45,-112.07),tennessee=place('Food City',36.31,-82.35);
 assert.match(ownershipFor(arizona).parent,/Raley/);
 assert.match(ownershipFor(tennessee).parent,/K-VA-T/);
 for(const store of [arizona,tennessee]){
  assert.equal(filterPlaces([store],{origin:store,hidden:['corporate']}).length,0);
  const longer={...store,name:'Food City - Downtown'};
  assert.equal(ownershipFor(longer).type,'unknown');
  assert.equal(excludedBrandNameMatch(longer,['corporate']).parent,ownershipFor(store).parent);
 }
 const unrelated=place('Food City',30.27,-97.75);
 assert.equal(ownershipFor(unrelated).type,'unknown');
 assert.equal(ownershipFor({...unrelated,brand:'Food City'}).type,'unknown');
 assert.equal(excludedBrandNameMatch({...unrelated,name:'Food City - Downtown'},['corporate']),null);
 assert.equal(hiddenNameMatch(unrelated,['Food City']),'Food City');
});
test('regional shared names do not assign northeastern or Kroger ownership outside their scope',()=>{
 assert.match(ownershipFor(place('Price Chopper',42.81,-73.94)).parent,/Northeast Grocery/);
 assert.equal(ownershipFor(place('Price Chopper',39.1,-94.58)).type,'unknown');
 assert.equal(excludedBrandNameMatch(place('Price Chopper - Downtown',39.1,-94.58),['corporate']),null);
 assert.match(ownershipFor(place('City Market',39.06,-108.55)).parent,/Kroger/);
 assert.equal(ownershipFor(place('City Market',43.04,-87.91)).type,'unknown');
 assert.match(ownershipFor(place('Foodtown',40.73,-73.99)).parent,/Foodtown|Allegiance/);
 assert.equal(ownershipFor(place('Foodtown',29.76,-95.37)).type,'unknown');
});
test('Tom Thumb grocery and convenience stores have different reviewed affiliations',()=>{
 const texas=place('Tom Thumb',32.78,-96.8),florida=place('Tom Thumb',30.43,-86.62);
 assert.match(ownershipFor(texas).parent,/Albertsons/);assert.equal(ownershipFor(texas).type,'corporate');
 assert.match(ownershipFor(florida).parent,/TDR/);assert.equal(ownershipFor(florida).type,'pe');
 assert.match(excludedBrandNameMatch({...florida,name:'Tom Thumb - Downtown'},['pe']).parent,/TDR/);
 assert.equal(excludedBrandNameMatch({...texas,name:'Tom Thumb - Downtown'},['pe']),null);
 const outside=place('Tom Thumb',30.27,-97.75);
 assert.equal(ownershipFor(outside).type,'unknown');assert.equal(excludedBrandNameMatch(outside,['corporate','pe']),null);
});
test('researched Hawaiian banners match while unrelated international stores remain unknown',()=>{
 const hawaii=place('Times Supermarket',21.31,-157.86);
 assert.ok(inUSCoverage(hawaii));assert.equal(ownershipFor(hawaii).type,'corporate');
 assert.match(ownershipFor(hawaii).parent,/Pan Pacific|PPIH/);
 assert.ok(excludedBrandNameMatch({...hawaii,name:'Times Supermarket - Honolulu'},['corporate']));
 assert.equal(ownershipFor(place('Times Supermarket',30.27,-97.75)).type,'unknown');
 assert.equal(ownershipFor(place('CVS Pharmacy',51.5,-.1,'other')).type,'unknown');
 assert.equal(inUSCoverage({lat:NaN,lng:-157}),false);
});
test('shared aliases require nonoverlapping validated geographic bounds',()=>{
 const template=BRAND_DIRECTORY.find(b=>b.brand==='Food City (Bashas’)');
 const west={south:30,west:-120,north:40,east:-110},east={south:30,west:-90,north:40,east:-80};
 const first={...template,brand:'Western chain',aliases:['Shared Market'],matchBounds:[west]};
 const second={...template,brand:'Eastern chain',aliases:['Shared Market'],matchBounds:[east]};
 const dataset=brands=>({version:1,brands});
 assert.doesNotThrow(()=>validateDirectory(dataset([first,second])));
 assert.throws(()=>validateDirectory(dataset([first,{...second,matchBounds:[west]}])),/Ambiguous alias/);
 const {matchBounds:unused,...unscoped}=second;
 assert.throws(()=>validateDirectory(dataset([first,unscoped])),/Ambiguous alias/);
 const touching={south:30,west:-110,north:40,east:-100};
 assert.ok(boundsOverlap(west,touching));
 assert.throws(()=>validateDirectory(dataset([first,{...second,matchBounds:[touching]}])),/Ambiguous alias/);
 for(const invalid of [null,0,[],{},[null],[{...west,south:NaN}],[{...west,north:91}],[{...west,east:181}],[{...west,south:40}],[{...west,west:-100}]]){
  assert.throws(()=>validateDirectory(dataset([{...first,matchBounds:invalid}])),/geographic scope/);
 }
});
test('JSON and CSV exports retain geographic guards for downstream consumers',async()=>{
 const download=JSON.parse(await readFile(new URL('../public/brands.json',import.meta.url),'utf8'));
 const row=download.brands.find(b=>b.brand==='Food City (Bashas’)');
 assert.deepEqual(row.matchBounds,BRAND_DIRECTORY.find(b=>b.brand===row.brand).matchBounds);
 const csv=await readFile(new URL('../public/brands.csv',import.meta.url),'utf8');
 assert.ok(csv.split('\r\n')[0].includes('"matchBounds"'));
 const csvRow=csv.split('\r\n').find(line=>line.startsWith('"Food City (Bashas’)"'));
 assert.ok(csvRow.includes(JSON.stringify(row.matchBounds).replaceAll('"','""')));
});
