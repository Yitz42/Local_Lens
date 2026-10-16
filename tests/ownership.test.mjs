import test from 'node:test';import assert from 'node:assert/strict';
import {ownershipFor,filterPlaces,fromOSM,distance} from '../public/ownership.js';
const origin={lat:30.2747,lng:-97.7523};
const p=(name,extra={})=>({id:name,name,category:'restaurant',...origin,...extra});
test('ownership uses exact brands and never assumes unknown means independent',()=>{
 assert.equal(ownershipFor(p('Subway')).type,'pe');
 assert.equal(ownershipFor(p('Subway Cafe Independent')).type,'unknown');
 assert.equal(ownershipFor(p('Shell Cafe')).type,'unknown');
 assert.equal(ownershipFor(p('Neighborhood Kitchen')).type,'unknown');
 assert.equal(ownershipFor(p('Dunkin’')).type,'pe');
 assert.equal(ownershipFor(p('Whole Foods Market')).parent,'Amazon');
 assert.equal(ownershipFor(p('Central Market',{category:'grocery'})).type,'corporate');
});
test('local and US matches are geographically limited',()=>{
 assert.equal(ownershipFor(p('Wheatsville Food Co-op')).type,'independent');
 assert.equal(ownershipFor(p('BookPeople',{lat:40.7,lng:-74})).type,'unknown');
 assert.equal(ownershipFor(p('Starbucks',{lat:51.5,lng:-.1})).type,'unknown');
});
test('national restaurant and pharmacy chains have sourced corporate classifications',()=>{
 const brands=[
  {names:['Chick-fil-A','CHICK FIL A','Chick-fil-A #1234'],parent:'Chick-fil-A, Inc.'},
  {names:['Einstein Bros. Bagels','Einstein Bros Bagels','Einstein Brothers Bagels','Einstein’s Bagels','Einstein Bagels','Einstein Bros. Bagels store #42'],parent:'Bagel Brands · JAB Holding Company'},
  {names:['CVS','CVS/pharmacy','CVS Pharmacy #1234','CVS/pharmacy#5678','CVS Pharmacy y más','CVS Pharmacy at Target'],parent:'CVS Health Corporation'}
 ];
 for(const {names,parent} of brands)for(const name of names){
  const match=ownershipFor(p(name));
  assert.equal(match.type,'corporate',name);assert.equal(match.parent,parent,name);
  assert.match(match.source,/^https:\/\//);assert.ok(match.checked);
 }
 assert.equal(ownershipFor(p('Downtown location',{brand:'Chick-fil-A'})).parent,'Chick-fil-A, Inc.');
 assert.equal(ownershipFor(p('Campus bagel shop',{brand:'Einstein Bros. Bagels'})).type,'corporate');
 assert.equal(ownershipFor(p('Main Street pharmacy',{brand:'CVS/pharmacy'})).type,'corporate');
});
test('new chain matches do not absorb unrelated names or relax geographic coverage',()=>{
 for(const name of ['Chick-fil-A Fan Club','Einstein Academy','Einstein Cafe','CVS Consulting','CVS Pharmacy Services Independent','Shell Cafe #123'])assert.equal(ownershipFor(p(name)).type,'unknown',name);
 assert.equal(ownershipFor(p('CVS Pharmacy',{lat:51.5,lng:-.1})).type,'unknown');
});
test('corporate exclusion hides the corrected brands while retaining unknown places',()=>{
 const places=[p('Chick-fil-A'),p('Einstein’s Bagels'),p('CVS/pharmacy #1234',{category:'other'}),p('Neighborhood Kitchen')];
 assert.equal(filterPlaces(places,{origin}).length,4);
 assert.deepEqual(filterPlaces(places,{origin,hidden:['corporate']}).map(p=>p.name),['Neighborhood Kitchen']);
 assert.equal(filterPlaces(places,{origin,hidden:['pe']}).length,4);
});
test('ownership exclusions combine with categories and radius',()=>{
 const places=[p('Subway'),p('Whole Foods Market',{category:'grocery'}),p('Neighborhood Kitchen'),p('Wheatsville Food Co-op',{category:'grocery'}),p('Faraway',{lat:35})];
 const options={origin,hidden:['pe','corporate'],radius:3500};
 assert.deepEqual(filterPlaces(places,options).map(p=>p.name),['Neighborhood Kitchen','Wheatsville Food Co-op']);
 assert.deepEqual(filterPlaces(places,{...options,category:'grocery',hidden:['pe','corporate','unknown']}).map(p=>p.name),['Wheatsville Food Co-op']);
});
test('OSM nodes and area centers normalize to mapped places',()=>{
 const data=fromOSM([{type:'way',id:1,center:{lat:30.2,lon:-97.7},tags:{name:'A Market',shop:'supermarket','addr:housenumber':'100','addr:street':'Main St'}},{type:'node',id:2,lat:30.2,lon:-97.7,tags:{name:'A Market',shop:'supermarket'}},{type:'node',id:3,tags:{name:'Missing location'}}]);
 assert.equal(data.length,1);assert.equal(data[0].category,'grocery');assert.equal(data[0].address,'100 Main St');assert.equal(data[0].id,'way/1');assert.equal(distance(origin,origin),0);
});
