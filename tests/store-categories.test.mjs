import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryForOverture} from '../worker/overture.js';
import {googleCategory,googleSearchGroups} from '../public/google-places.js';
import {CATEGORIES,categoryFor,filterPlaces,ownershipFor} from '../public/ownership.js';
import {excludedBrandNameMatch} from '../public/name-filters.js';
import {PLACE_CATEGORIES} from '../public/brand-scope.js';
const origin={lat:30.2747,lng:-97.7523};
const p=(name,category)=>({id:name,name,category,...origin});
const hierarchy=(...terms)=>({taxonomy:JSON.stringify({hierarchy:['shopping',...terms]})});
test('store listings use pharmacy, home, apparel, and general categories before More stores',()=>{
 assert.deepEqual(CATEGORIES.map(category=>category.id),['all',...PLACE_CATEGORIES]);
 assert.equal(categoryForOverture({basic_category:'pharmacy_and_drug_store',...hierarchy('specialty_store','pharmacy_and_drug_store','pharmacy')}),'pharmacy');
 assert.equal(categoryForOverture({basic_category:'hardware_home_and_garden_store',...hierarchy('specialty_store','hardware_home_and_garden_store','furniture_store')}),'home');
 assert.equal(categoryForOverture({basic_category:'fashion_and_apparel_store',...hierarchy('fashion_and_apparel_store','jewelry_store')}),'apparel');
 assert.equal(categoryForOverture({basic_category:'discount_store',...hierarchy('discount_store')}),'general');
 assert.equal(categoryForOverture({basic_category:'warehouse_club_store',...hierarchy('warehouse_club_store')}),'general');
 assert.equal(categoryForOverture({basic_category:'electronics_store',...hierarchy('specialty_store','electronics_store')}),'other');
 assert.equal(categoryForOverture({basic_category:'convenience_store',...hierarchy('convenience_store')}),'grocery');
 assert.equal(categoryFor({amenity:'pharmacy'}),'pharmacy');assert.equal(categoryFor({shop:'doityourself'}),'home');
 assert.equal(categoryFor({shop:'shoes'}),'apparel');assert.equal(categoryFor({shop:'variety_store'}),'general');assert.equal(categoryFor({shop:'books'}),'other');
 assert.equal(googleCategory(['drugstore']),'pharmacy');assert.equal(googleCategory(['home_improvement_store']),'home');
 assert.equal(googleCategory(['shoe_store']),'apparel');assert.equal(googleCategory(['warehouse_store']),'general');
 assert.equal(googleCategory(['supermarket','department_store']),'grocery');assert.equal(googleCategory(['book_store']),'other');
});
test('an all-places Google search stays within five requests while store categories search their own types',()=>{
 const all=googleSearchGroups('all');
 assert.equal(all.length,5);assert.ok(all[4].includes('pharmacy')&&all[4].includes('clothing_store')&&all[4].includes('book_store'));
 assert.ok(all.every(group=>group.length<=50&&new Set(group).size===group.length));
 assert.deepEqual(googleSearchGroups('pharmacy'),[['pharmacy','drugstore']]);
 assert.ok(googleSearchGroups('home')[0].includes('hardware_store'));
});
test('brand guards written for More stores cover every split store category',()=>{
 for(const category of ['pharmacy','home','apparel','general','other']){
  assert.equal(ownershipFor(p('CVS Pharmacy #1234',category)).type,'corporate',category);
  assert.ok(excludedBrandNameMatch(p('Petco - Downtown',category),['pe']),category);
 }
 assert.equal(ownershipFor(p('ACME','pharmacy')).type,'unknown');
 assert.equal(ownershipFor(p('Apple','restaurant')).type,'unknown');
 const places=[p('Corner Pharmacy','pharmacy'),p('Corner Hardware','home'),p('Corner Shoes','apparel'),p('Corner Discount','general'),p('Corner Books','other')];
 for(const place of places)assert.deepEqual(filterPlaces(places,{origin,category:place.category}).map(item=>item.name),[place.name]);
});
