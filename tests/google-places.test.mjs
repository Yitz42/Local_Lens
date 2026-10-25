import test from 'node:test';
import assert from 'node:assert/strict';
import {GOOGLE_FIELDS,googleSearchGroups,normalizeGooglePlace,searchGooglePlaces,resolveGoogleSaved,savedGoogleIds,googleKey} from '../public/google-places.js';
import {filterPlaces} from '../public/ownership.js';
const origin={lat:30.2747,lng:-97.7523};
const raw=(extra={})=>({id:'ChIJTest',displayName:'Town Pizza',location:{lat:()=>origin.lat,lng:()=>origin.lng},formattedAddress:'100 Main St',businessStatus:'OPERATIONAL',primaryType:'pizza_restaurant',types:['restaurant','pizza_restaurant'],attributions:[{provider:'Data Provider',providerURI:'https://example.com'}],...extra});
test('Google listings preserve explicit food types and exclude closed or future businesses',()=>{
 const place=normalizeGooglePlace(raw());
 assert.equal(place.id,'google/ChIJTest');assert.equal(place.category,'restaurant');assert.deepEqual(place.foodTypes,['pizza']);assert.equal(place.source,'Google Maps');assert.deepEqual(place.attributions,raw().attributions);
 for(const businessStatus of ['CLOSED_PERMANENTLY','CLOSED_TEMPORARILY','FUTURE_OPENING'])assert.equal(normalizeGooglePlace(raw({businessStatus})),null);
 assert.equal(normalizeGooglePlace(raw({location:null})),null);
 assert.equal(normalizeGooglePlace(raw({types:[],primaryType:'pharmacy'})).category,'other');
 assert.deepEqual(normalizeGooglePlace(raw({displayName:'Pizza Palace',types:['restaurant'],primaryType:'restaurant'})).foodTypes,[]);
});
test('Google listings use the existing default ownership exclusions',()=>{
 const places=['Town Pizza','CVS Pharmacy','Five Guys','Rite Aid'].map((name,i)=>normalizeGooglePlace(raw({id:'Place'+i,displayName:name})));
 assert.deepEqual(filterPlaces(places,{origin,hidden:['corporate','pe']}).map(p=>p.name),['Town Pizza']);
});
test('Google requests are bounded, preserve result attribution, and request fields explicitly',async()=>{
 const requests=[],Place={async searchNearby(request){requests.push(request);return {places:[raw()]};}};
 const result=await searchGooglePlaces(Place,origin,3219);
 assert.equal(requests.length,5);assert.equal(result.places.length,1);assert.equal(result.limited,true);
 for(const request of requests){assert.equal(request.maxResultCount,20);assert.deepEqual(request.fields,GOOGLE_FIELDS);assert.equal(request.rankPreference,'DISTANCE');assert.deepEqual(request.locationRestriction,{center:origin,radius:3219});}
 assert.deepEqual(googleSearchGroups('all',['italian','pizza']),[['italian_restaurant','pizza_restaurant']]);
 assert.equal(googleSearchGroups('grocery').length,1);
 assert.ok(!GOOGLE_FIELDS.includes('websiteURI'));assert.ok(!GOOGLE_FIELDS.includes('rating'));
});
test('Google search failure is not presented as an empty successful area',async()=>{
 await assert.rejects(searchGooglePlaces({searchNearby:async()=>{throw Error('Denied');}},origin,3219),/Denied/);
});
test('Google saved records resolve from IDs and retain unavailable IDs for removal',async()=>{
 class Place{constructor({id}){this.id=id;}async fetchFields(){if(this.id==='missing')throw Error('Missing');return {place:raw({id:this.id,businessStatus:this.id==='closed'?'CLOSED_PERMANENTLY':'OPERATIONAL'})};}}
 const result=await resolveGoogleSaved(Place,['live','closed','missing','live']);
 assert.deepEqual(result.places.map(p=>p.googlePlaceId),['live']);assert.deepEqual(result.unavailable,['closed','missing']);
 assert.deepEqual(savedGoogleIds(['valid','valid',null,{},'<script>']),['valid']);
 assert.equal(googleKey({getItem:()=>{throw Error('Storage blocked');}}),'');
});
