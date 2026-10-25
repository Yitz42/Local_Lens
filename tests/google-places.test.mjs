import test from 'node:test';
import assert from 'node:assert/strict';
import {GOOGLE_FIELDS,googleSearchGroups,normalizeGooglePlace,searchGooglePlaces,resolveGoogleSaved,savedGoogleIds,googleKey} from '../public/google-places.js';
import {filterPlaces,ownershipFor} from '../public/ownership.js';
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
test('Google Starbucks Coffee Company listings match the corporate brand exactly',()=>{
 for(const displayName of ['Starbucks Coffee Company','Starbucks Coffee Company #1234','Starbucks Coffee','Starbucks']){
  const place=normalizeGooglePlace(raw({displayName,primaryType:'coffee_shop',types:['coffee_shop','cafe']}));
  assert.equal(ownershipFor(place).brand,'Starbucks');assert.equal(ownershipFor(place).type,'corporate');
  assert.equal(filterPlaces([place],{origin,hidden:['corporate','pe']}).length,0,displayName);
  assert.equal(filterPlaces([place],{origin,hidden:[]}).length,1,displayName);
 }
 const unrelated=normalizeGooglePlace(raw({displayName:'Starbucks Coffee Company Consulting'}));
 assert.equal(ownershipFor(unrelated).type,'unknown');
});
test('CVS Photo departments inherit CVS corporate ownership from their exact listing names',()=>{
 for(const displayName of ['CVS Photo','CVS Photo Center','CVS Photo #1234','CVS Photo Center store #42']){
  const place=normalizeGooglePlace(raw({displayName,primaryType:'electronics_store',types:['electronics_store','store']}));
  const ownership=ownershipFor(place);
  assert.equal(ownership.brand,'CVS Pharmacy');assert.equal(ownership.parent,'CVS Health Corporation');assert.equal(ownership.type,'corporate');
  assert.equal(filterPlaces([place],{origin,hidden:['corporate','pe']}).length,0,displayName);
  assert.equal(filterPlaces([place],{origin,hidden:[]}).length,1,displayName);
 }
 for(const displayName of ['CVS Photography','CVS Photo Studio Independent'])assert.equal(ownershipFor(normalizeGooglePlace(raw({displayName}))).type,'unknown');
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
