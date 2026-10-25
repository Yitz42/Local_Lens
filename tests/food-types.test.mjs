import test from 'node:test';
import assert from 'node:assert/strict';
import {FOOD_TYPES,DEFAULT_OWNERSHIP_FILTERS,OWNERSHIP_PREFERENCE_KEY,initialOwnershipFilters,foodTypesFromTerms,foodTypesForPlace,matchesFoodTypes} from '../public/food-types.js';
import {fromOSM,filterPlaces} from '../public/ownership.js';
import {normalizePlace,categoryForOverture,PLACE_FORMAT} from '../worker/overture.js';
import {findNearbyCache,PLACE_CACHE_FORMAT} from '../public/place-cache.js';
import {createWorker} from '../worker/index.js';

test('ownership filters start enabled and remember explicit choices including show-all',()=>{
 assert.deepEqual(initialOwnershipFilters(null),['pe','corporate']);
 assert.deepEqual(initialOwnershipFilters({hidden:[]}),DEFAULT_OWNERSHIP_FILTERS);
 assert.deepEqual(initialOwnershipFilters(['invalid']),DEFAULT_OWNERSHIP_FILTERS);
 assert.deepEqual(initialOwnershipFilters([]),[]);
 assert.deepEqual(initialOwnershipFilters(['pe','pe','invalid']),['pe']);
 assert.deepEqual(initialOwnershipFilters(['unknown','corporate']),['unknown','corporate']);
 assert.notEqual(OWNERSHIP_PREFERENCE_KEY,'local-lens-hidden');
});
test('food tags preserve multiple cuisines, normalize aliases, and ignore unsupported text',()=>{
 assert.deepEqual(foodTypesFromTerms('italian;pizza'),['italian','pizza']);
 assert.deepEqual(foodTypesFromTerms(['Tex-Mex','burger','BBQ']),['mexican','burgers','barbecue']);
 assert.deepEqual(foodTypesForPlace({cuisine:'Italian; pizza',foodTypes:['pizza']}),['italian','pizza']);
 assert.equal(matchesFoodTypes({cuisine:'pizza'},['italian','pizza']),true);
 assert.equal(matchesFoodTypes({cuisine:'chinese'},['italian','pizza']),false);
 assert.equal(matchesFoodTypes({name:'Italian Pizza Cafe'},['italian','pizza']),false);
 assert.equal(matchesFoodTypes({name:'Unknown cuisine'},[]),true);
 assert.equal(new Set(FOOD_TYPES.map(type=>type.id)).size,FOOD_TYPES.length);
});
test('Overture primary, hierarchy, and alternate classifications survive normalization',()=>{
 const feature={geometry:{type:'Point',coordinates:[-97.75,30.27]},properties:{id:'food-123','@name':'Local kitchen',basic_category:'restaurant',taxonomy:JSON.stringify({primary:'pizza_restaurant',hierarchy:['food_and_drink','restaurant','italian_restaurant','pizza_restaurant'],alternates:['seafood_restaurant']})}};
 const place=normalizePlace(feature);
 assert.deepEqual(place.foodTypes,['italian','pizza','seafood']);
 assert.ok(place.cuisine.includes('Italian'));assert.ok(place.cuisine.includes('Pizza'));
 const blank=normalizePlace({...feature,properties:{...feature.properties,taxonomy:'{}','@name':'Italian Pizza Kitchen'}});
 assert.deepEqual(blank.foodTypes,[]);
 assert.equal(categoryForOverture({basic_category:'restaurant',taxonomy:{alternates:['gas_station']}}),'restaurant');
});
test('OSM snapshots and saved legacy cuisine strings retain every supported type',()=>{
 const places=fromOSM([{type:'node',id:7,lat:30.27,lon:-97.75,tags:{name:'Neighborhood kitchen',amenity:'restaurant',cuisine:'italian;pizza;seafood'}}]);
 assert.deepEqual(places[0].foodTypes,['italian','pizza','seafood']);
 assert.ok(places[0].cuisine.includes('pizza'));
 assert.deepEqual(foodTypesForPlace({cuisine:'pizza'}),['pizza']);
});
test('food selections combine with ownership, distance, and broad categories',()=>{
 const origin={lat:30.2747,lng:-97.7523};
 const make=(name,cuisine,extra={})=>({id:name,name,cuisine,category:'restaurant',...origin,...extra});
 const places=[make('Town Kitchen','italian'),make('Town Slice','pizza'),make('Town Noodles','chinese'),make('Olive Garden','italian'),make('Far Italian','italian',{lat:40}),make('Market','pizza',{category:'grocery'}),make('Pizza Shop','')];
 assert.deepEqual(filterPlaces(places,{origin,category:'restaurant',hidden:DEFAULT_OWNERSHIP_FILTERS,foodTypes:['italian','pizza'],radius:3200}).map(place=>place.name),['Town Kitchen','Town Slice']);
});
test('legacy nearby caches and edge responses cannot hide new cuisine metadata',async()=>{
 const now=Date.now(),origin={lat:30.27,lng:-97.75},record={origin,radius:3200,places:[],savedAt:now};
 assert.equal(findNearbyCache([record],origin,1600,now),null);
 assert.equal(findNearbyCache([{...record,format:1}],origin,1600,now),null);
 const current={...record,format:PLACE_CACHE_FORMAT};assert.equal(findNearbyCache([current],origin,1600,now),current);
 const keys=[];const cache={match:async request=>{keys.push(request.url);return undefined;},put:async()=>{}};
 const worker=createWorker({}, {cache,lookup:async()=>({places:[],totalPages:1,page:0,fetchedAt:new Date().toISOString()})});
 assert.equal((await worker.fetch(new Request('https://local.test/api/places?lat=30.27&lng=-97.75&radius=1600'))).status,200);
 assert.ok(keys.every(key=>key.includes(PLACE_FORMAT)));
});
