import test from 'node:test';import assert from 'node:assert/strict';
import {ownershipFor,filterPlaces,fromOSM,distance} from '../public/ownership.js';
import {allBrandsFilterState,setAllBrandsHidden} from '../public/ownership-categories.js';
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
test('former pharmacy chains are classified in legacy records without claiming a current listing',()=>{
 const names=['Rite Aid','RiteAid','Rite Aid Pharmacy #1234','Rite Aid Drugstore','Bartell Drugs','Bartell Drug Company','Bartell Drugs Pharmacy #42'];
 for(const category of ['grocery','other'])for(const name of names){
  const place=p(name,{category}),match=ownershipFor(place);
  assert.equal(match.type,'corporate',name);assert.equal(match.publicListing,undefined);
  assert.match(match.note,/2025/);assert.match(match.note,/legacy/i);
  assert.equal(filterPlaces([place],{origin,hidden:['corporate','pe']}).length,0,name);
 }
 assert.equal(ownershipFor(p('Downtown pharmacy',{brand:'Rite Aid'})).brand,'Rite Aid');
 for(const name of ['Rite Aid Consulting','Rite Away Pharmacy','Bartell Family Market','Rite Aid Independent Clinic'])assert.equal(ownershipFor(p(name)).type,'unknown',name);
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

test('listed companies with PE backing match either exclusion independently',()=>{
 const brands=['Petco','Canada Goose','Birkenstock',"Bob's Discount Furniture",'Life Time','LifeStance Health','Torrid','Meineke'];
 for(const name of brands){
  const place=p(name,{category:'other'});
  assert.equal(ownershipFor(place).type,'pe',name);
  assert.equal(filterPlaces([place],{origin,hidden:['corporate']}).length,0,name);
  assert.equal(filterPlaces([place],{origin,hidden:['pe']}).length,0,name);
  assert.equal(filterPlaces([place],{origin,hidden:['corporate','pe']}).length,0,name);
 }
});
test('public financial sponsors do not make private portfolio companies listed',()=>{
 const places=[p("Jersey Mike's Subs"),p('Mister Car Wash'),p('Walgreens')];
 assert.equal(filterPlaces(places,{origin,hidden:['corporate']}).length,3);
 assert.equal(filterPlaces(places,{origin,hidden:['pe']}).length,0);
});
test('listed retail additions retain exact matching and category context',()=>{
 assert.equal(ownershipFor(p('Apple',{category:'other'})).type,'corporate');
 assert.equal(ownershipFor(p('Apple')).type,'unknown');
 assert.equal(ownershipFor(p('Apple repair independent',{category:'other'})).type,'unknown');
 assert.equal(ownershipFor(p('CAVA')).type,'corporate');
 assert.equal(ownershipFor(p('Sweetgreen')).type,'corporate');
 assert.equal(ownershipFor(p('Dutch Bros Coffee',{category:'coffee'})).type,'corporate');
});
test('large private Five Guys variants match without absorbing unrelated businesses',()=>{
 for(const name of ['Five Guys','Five Guys Burgers and Fries','Five Guys Burgers & Fries','Five Guys #123']){
  const match=ownershipFor(p(name));assert.equal(match.type,'corporate',name);assert.match(match.parent,/Five Guys/);assert.equal(match.publicListing,undefined);
  assert.equal(filterPlaces([p(name)],{origin,hidden:['corporate']}).length,0);
 }
 assert.equal(ownershipFor(p('Five Guys Plumbing')).type,'unknown');
 assert.equal(ownershipFor(p('Five Guys',{category:'other'})).type,'unknown');
 assert.equal(ownershipFor(p('Five Guys',{lat:51.5,lng:-.1})).type,'unknown');
});
test('the all-brands control combines corporate and PE exclusions while preserving unknown choices',()=>{
 const mixed=['corporate','unknown'];
 assert.deepEqual(allBrandsFilterState(mixed),{checked:false,indeterminate:true});
 const all=setAllBrandsHidden(mixed,true);assert.deepEqual(allBrandsFilterState(all),{checked:true,indeterminate:false});
 assert.ok(all.includes('unknown'));assert.deepEqual(setAllBrandsHidden(all,false),['unknown']);
 assert.deepEqual(mixed,['corporate','unknown']);
 const places=[p('Five Guys'),p('Subway'),p('Chick-fil-A'),p('Petco',{category:'other'}),p('Town Kitchen')];
 assert.deepEqual(filterPlaces(places,{origin,hidden:setAllBrandsHidden([],true)}).map(place=>place.name),['Town Kitchen']);
 assert.equal(filterPlaces(places,{origin,hidden:setAllBrandsHidden([],false)}).length,places.length);
});
