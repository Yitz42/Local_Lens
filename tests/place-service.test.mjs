import test from 'node:test';import assert from 'node:assert/strict';
import {createWorker} from '../worker/index.js';
import {planTiles,normalizePlace,categoryForOverture,RELEASE} from '../worker/overture.js';
import {collectPlacePages} from '../public/places-loader.js';
import {findNearbyCache,PLACE_CACHE_FORMAT} from '../public/place-cache.js';
const url='https://local.test/api/places?lat=42.360&lng=-71.058&radius=1609';
const item={id:'overture/abc',name:'Neighborhood Market',lat:42.36,lng:-71.058,category:'grocery'};
const payload={places:[item],page:0,totalPages:1,release:RELEASE,dataDate:'2026-10-21T00:00:00Z',fetchedAt:new Date().toISOString()};
class MemoryCache{map=new Map();async match(req){return this.map.get(req.url)?.clone();}async put(req,res){this.map.set(req.url,res.clone());}}
test('a transient file failure retries automatically and completed pages are cached',async()=>{
 let calls=0;const worker=createWorker({}, {lookup:async()=>{calls++;if(calls===1)throw new Error('temporary connection');return payload;}});
 assert.equal((await worker.fetch(new Request(url))).status,200);assert.equal(calls,2);
 const cached=await worker.fetch(new Request(url));assert.equal((await cached.json()).cache,'memory');assert.equal(calls,2);
});
test('edge cache preserves completed pages if every archive request fails',async()=>{
 const cache=new MemoryCache(),good=createWorker({}, {cache,lookup:async()=>payload});await good.fetch(new Request(url));
 for(const key of cache.map.keys())if(!key.includes('stale=1'))cache.map.delete(key);
 const bad=createWorker({}, {cache,lookup:async()=>{throw new Error('offline');}});
 const response=await bad.fetch(new Request(url));assert.equal(response.status,200);assert.equal((await response.json()).stale,true);
});
test('an archive outage never becomes an empty success response',async()=>{
 const worker=createWorker({}, {lookup:async()=>{throw new Error('offline');}});assert.equal((await worker.fetch(new Request(url))).status,503);
});
test('invalid inputs and methods cannot read the archive',async()=>{
 const worker=createWorker({}, {lookup:()=>{throw new Error('must not run');}});
 for(const q of ['', '?lat=&lng=1&radius=3219','?lat=bad&lng=1&radius=3219','?lat=1&lng=1&radius=999999','?lat=1&lng=1&radius=3219&page=-1'])assert.equal((await worker.fetch(new Request('https://local.test/api/places'+q))).status,400);
 assert.equal((await worker.fetch(new Request(url,{method:'POST'}))).status,405);
});
test('tile coverage grows with radius and wraps across the date line',()=>{
 assert.ok(planTiles(42.36,-71.058,1609).length>1);
 assert.ok(planTiles(42.36,-71.058,8047).length>planTiles(42.36,-71.058,1609).length);
 assert.ok(planTiles(0,179.999,1609).some(t=>t.x===0));
 assert.ok(planTiles(0,179.999,1609).every(t=>t.x>=0&&t.x<2**14&&t.y>=0&&t.y<2**14));
 assert.throws(()=>planTiles(85,0,10000),RangeError);
});
test('Overture records preserve brand, geography, address, category and source',()=>{
 const record=normalizePlace({geometry:{type:'Point',coordinates:[-71.058,42.36]},properties:{id:'aabb-1234','@name':'Neighborhood Market',basic_category:'grocery_store',brand:'{"names":{"primary":"Brand"}}',addresses:'[{"freeform":"10 Main St","locality":"Boston"}]',websites:'["https://example.com"]'}});
 assert.equal(record.category,'grocery');assert.equal(record.brand,'Brand');assert.equal(record.address,'10 Main St');assert.equal(record.source,'Overture Maps');assert.equal(record.id,'overture/aabb-1234');
 assert.equal(categoryForOverture({basic_category:'gas_station'}),'gas');
 assert.equal(categoryForOverture({basic_category:'coffee_shop'}),'coffee');
 assert.equal(categoryForOverture({basic_category:'restaurant'}),'restaurant');
 assert.equal(categoryForOverture({taxonomy:'{"hierarchy":["shopping","clothing_store"]}'}),'apparel');
 assert.equal(categoryForOverture({basic_category:'financial_service'}),null);
 assert.equal(normalizePlace({geometry:{type:'Point',coordinates:[0,0]},properties:{id:'closed','@name':'Old shop',basic_category:'restaurant',operating_status:'permanently_closed'}}),null);
});
test('client collects every page and removes shared tile-edge duplicates',async()=>{
 const requested=[],progress=[];
 const response=await collectPlacePages(async page=>{requested.push(page);return {...payload,page,totalPages:5,places:[item,{...item,id:'overture/'+page}]};},(done,total)=>progress.push([done,total]));
 assert.deepEqual(requested.sort(),[0,1,2,3,4]);assert.equal(response.places.length,6);assert.equal(response.complete,true);assert.deepEqual(progress.at(-1),[5,5]);
});
test('a missing or inconsistent page cannot masquerade as a complete area',async()=>{
 await assert.rejects(()=>collectPlacePages(async page=>page===0?{...payload,totalPages:2}:{...payload,page:1,totalPages:2,release:'other'}));
 await assert.rejects(()=>collectPlacePages(async page=>{if(page)throw new Error('offline');return {...payload,totalPages:2};}));
});
test('cached places cannot leak into a different city or larger radius',()=>{
 const now=Date.now(),record={format:PLACE_CACHE_FORMAT,origin:{lat:42.36,lng:-71.058},radius:3219,places:[item],savedAt:now};
 assert.equal(findNearbyCache([record],record.origin,1609,now),record);
 assert.equal(findNearbyCache([record],{lat:47.606,lng:-122.332},1609,now),null);
 assert.equal(findNearbyCache([record],record.origin,8047,now),null);
 assert.equal(findNearbyCache([record],record.origin,1609,now+8*86400000),null);
});
