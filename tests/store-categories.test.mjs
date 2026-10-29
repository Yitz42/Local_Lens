import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryForOverture} from '../worker/overture.js';
import {googleCategory,googleSearchGroups} from '../public/google-places.js';
import {CATEGORIES,categoryFor,filterPlaces,ownershipFor,fromOSM} from '../public/ownership.js';
import {GOOGLE_TYPES} from '../public/google-places.js';
const GOOGLE_TYPES_GROCERY=GOOGLE_TYPES.grocery;
import {excludedBrandNameMatch} from '../public/name-filters.js';
import {PLACE_CATEGORIES} from '../public/brand-scope.js';
const origin={lat:30.2747,lng:-97.7523};
const p=(name,category)=>({id:name,name,category,...origin});
const hierarchy=(...terms)=>({taxonomy:JSON.stringify({hierarchy:['shopping',...terms]})});
test('store listings use pharmacy, home, apparel, and general categories before More stores',()=>{
 assert.deepEqual(CATEGORIES.map(category=>category.id).sort(),['all',...PLACE_CATEGORIES].sort());
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
test('bars, services, and banks have their own categories and More stores has subtypes',async()=>{
 const {storeTypeFromTerms}=await import('../public/store-types.js');
 const {normalizePlace}=await import('../worker/overture.js');
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'bar',...h('food_and_drink','alcoholic_beverage_venue','bar','pub')}),'bar');
 assert.equal(categoryForOverture({basic_category:'restaurant',...h('food_and_drink','restaurant','gastropub'),}),'restaurant');
 assert.equal(categoryForOverture({basic_category:'personal_or_beauty_service',...h('lifestyle_services','personal_or_beauty_service','barber')}),'beauty');
 assert.equal(categoryForOverture({basic_category:'gym',...h('sports_and_recreation','sport_or_fitness_facility','gym')}),'fitness');
 assert.equal(categoryForOverture({basic_category:'automotive_service',...h('travel_and_transportation','vehicle_service','automotive_service','car_wash')}),'auto');
 assert.equal(categoryForOverture({basic_category:'bank_or_credit_union',...h('services_and_business','financial_service','bank_or_credit_union','credit_union')}),'bank');
 assert.equal(categoryForOverture({basic_category:'food_and_beverage_store',...h('shopping','food_and_beverage_store','butcher_shop')}),'grocery');
 assert.equal(categoryForOverture({basic_category:'legal_service',...h('services_and_business','legal_service')}),null);
 const liquor=normalizePlace({geometry:{type:'Point',coordinates:[-97.75,30.27]},properties:{id:'liq-1','@name':'Corner Liquor',basic_category:'food_and_beverage_store',taxonomy:JSON.stringify({primary:'liquor_store',hierarchy:['shopping','food_and_beverage_store','liquor_store']})}});
 assert.equal(liquor.category,'other');assert.equal(liquor.storeType,'liquor');
 assert.equal(storeTypeFromTerms(['electronics_store']),'electronics');assert.equal(storeTypeFromTerms(['pet']),'pets');assert.equal(storeTypeFromTerms(['unusual']),'other');
 assert.equal(categoryFor({amenity:'pub'}),'bar');assert.equal(categoryFor({amenity:'bank'}),'bank');assert.equal(categoryFor({shop:'hairdresser'}),'beauty');assert.equal(categoryFor({leisure:'fitness_centre'}),'fitness');assert.equal(categoryFor({shop:'car_repair'}),'auto');assert.equal(categoryFor({shop:'butcher'}),'grocery');
 assert.equal(googleCategory(['bar']),'bar');assert.equal(googleCategory(['restaurant','bar']),'restaurant');assert.equal(googleCategory(['hair_care']),'beauty');assert.equal(googleCategory(['gym']),'fitness');assert.equal(googleCategory(['car_repair']),'auto');assert.equal(googleCategory(['bank']),'bank');
 assert.equal(googleSearchGroups('all').length,5);assert.deepEqual(googleSearchGroups('bank'),[['bank']]);
 const places=[{...p('Volt Electronics','other'),storeType:'electronics'},{...p('Pour House Liquor','other'),storeType:'liquor'},{...p('Old Shop','other')}];
 assert.deepEqual(filterPlaces(places,{origin,category:'other',storeType:'liquor'}).map(x=>x.name),['Pour House Liquor']);
 assert.deepEqual(filterPlaces(places,{origin,category:'other',storeType:'other'}).map(x=>x.name),['Old Shop']);
 assert.equal(filterPlaces(places,{origin,category:'other'}).length,3);
 assert.equal(ownershipFor(p('Hooters','bar')).type,'corporate');assert.equal(ownershipFor(p('Midas','auto')).type,'corporate');
});
test('bank names only match bank listings and credit unions are member-owned independents',()=>{
 assert.equal(ownershipFor(p('Chase','bank')).type,'corporate');assert.equal(ownershipFor(p('Chase','restaurant')).type,'unknown');
 assert.equal(ownershipFor(p('Citizens Bank','bank')).type,'unknown','Citizens is limited to its own footprint');
 assert.equal(ownershipFor({...p('Citizens Bank','bank'),lat:42.36,lng:-71.06}).type,'corporate');
 const navy=ownershipFor(p('Navy Federal Credit Union','bank'));assert.equal(navy.type,'independent');assert.equal(navy.localOperators,'memberowned');
 assert.equal(ownershipFor(p('Great Clips','beauty')).localOperators,'franchise');assert.equal(ownershipFor(p('Planet Fitness','fitness')).type,'corporate');assert.equal(ownershipFor(p('Jiffy Lube','auto')).type,'pe');
 const places=[p('Navy Federal Credit Union','bank'),p('Chase','bank'),p('Hometown Bank','bank')];
 const names=localLevel=>filterPlaces(places,{origin,category:'bank',hidden:['corporate','pe'],matchBrandNames:true,localLevel}).map(x=>x.name).sort();
 assert.deepEqual(names(1),['Hometown Bank','Navy Federal Credit Union']);
 assert.deepEqual(names(0),['Hometown Bank'],'Independent only hides credit unions');
});
test('foreign-owned US banks are corporate, and Webster Bank only matches in its footprint',()=>{
 for(const name of ['BMO','BMO Harris Bank','Santander Bank'])assert.equal(ownershipFor(p(name,'bank')).type,'corporate',name);
 assert.equal(ownershipFor(p('BMO','restaurant')).type,'unknown');
 const hartford={lat:41.76,lng:-72.67};
 assert.equal(ownershipFor({...p('Webster Bank','bank'),...hartford}).parent,'Banco Santander, S.A. (Santander Bank N.A.)');
 assert.equal(ownershipFor(p('Webster Bank','bank')).type,'unknown');
 assert.equal(ownershipFor({...p('Webster Five Cents Savings Bank','bank'),...hartford}).type,'unknown');
});
test('Google eateries that are also listed as bakeries or delis are restaurants',()=>{
 assert.equal(googleCategory(['bagel_shop','bakery','cafe','coffee_shop','restaurant','food_store','food','store'],'bagel_shop'),'restaurant');
 assert.equal(googleCategory(['bakery','restaurant','food'],'bakery'),'restaurant');
 assert.equal(googleCategory(['deli','sandwich_shop','restaurant']),'restaurant');
 assert.equal(googleCategory(['bakery','food_store','store'],'bakery'),'grocery');
 assert.equal(googleCategory(['supermarket','bakery','deli','restaurant'],'supermarket'),'grocery');
 assert.equal(googleCategory(['coffee_shop','bakery','restaurant'],'coffee_shop'),'coffee');
 assert.equal(googleCategory(['bar','restaurant'],'bar'),'bar');
});
test('kosher, vegetarian, and vegan are dietary requirements across food categories',async()=>{
 const {foodTypesFromTerms,matchesFoodTypes,foodTypeLabel}=await import('../public/food-types.js');
 const {googleSearchGroups}=await import('../public/google-places.js');
 assert.deepEqual(foodTypesFromTerms(['food_and_drink','restaurant','special_diet_restaurant','kosher_restaurant']),['kosher']);
 assert.deepEqual(foodTypesFromTerms(['vegan_restaurant']).sort(),['vegan','vegetarian']);
 const place=(name,category,foodTypes=[])=>({...p(name,category),foodTypes});
 assert.ok(matchesFoodTypes(place("Goldman's Kosher Bakery",'grocery'),['kosher']),'kosher in the name counts');
 assert.ok(!matchesFoodTypes(place('Kosher-Style Deli','restaurant'),['kosher']),'kosher-style does not');
 assert.ok(!matchesFoodTypes(place('Kosher Tape Plus','other'),['kosher']),'only food categories get dietary labels');
 assert.ok(matchesFoodTypes(place('Tov Pizza','restaurant',['kosher','pizza']),['kosher','pizza']));
 assert.ok(!matchesFoodTypes(place('Pizza Hut','restaurant',['pizza']),['kosher','pizza']),'a dietary choice is required, not optional');
 assert.ok(matchesFoodTypes(place('Green Leaf Vegan Cafe','coffee'),['vegetarian']),'vegan places are vegetarian');
 assert.ok(!matchesFoodTypes(place('Veggie Diner','restaurant',['vegetarian']),['vegan']));
 assert.equal(foodTypeLabel(place('Kosher Bite','restaurant',['burgers'])),'Kosher · Burgers');
 assert.deepEqual(fromOSM([{type:'node',id:1,lat:30.27,lon:-97.75,tags:{name:'Shalom Grill',amenity:'restaurant','diet:kosher':'only'}}])[0].foodTypes,['kosher']);
 assert.deepEqual(foodTypesFromTerms(['special_diet_restaurant','halal_restaurant']),['halal']);
 assert.ok(matchesFoodTypes(place('Dearborn Halal Meat','grocery'),['halal']));
 assert.deepEqual(fromOSM([{type:'node',id:2,lat:30.27,lon:-97.75,tags:{name:'Grill House',amenity:'restaurant','diet:halal':'yes'}}])[0].foodTypes,['halal']);
 assert.equal(googleSearchGroups('all',['halal']).length,5);
 assert.deepEqual(googleSearchGroups('all',['vegan']),[['vegan_restaurant']]);
 assert.deepEqual(googleSearchGroups('restaurant',['vegetarian']),[['vegetarian_restaurant','vegan_restaurant']]);
 assert.equal(googleSearchGroups('all',['kosher']).length,5,'kosher uses the normal groups plus a text search');
 assert.deepEqual(googleSearchGroups('grocery',['vegan']),[GOOGLE_TYPES_GROCERY]);
});
test('a Google kosher search adds one text search and tags nearby results',async()=>{
 const {searchGooglePlaces}=await import('../public/google-places.js');
 const raw=(id,name,lat,lng,types)=>({id,displayName:name,location:{lat,lng},types,primaryType:types[0],businessStatus:'OPERATIONAL'});
 const calls=[];
 const Place={
  searchNearby:async request=>{calls.push(['nearby',request.includedTypes]);return {places:[raw('a','Corner Diner',30.275,-97.752,['restaurant'])]};},
  searchByText:async request=>{calls.push(['text',request.textQuery]);return {places:[raw('b','Shalom Grill',30.276,-97.753,['restaurant']),raw('c','Far Away Kosher',31.5,-97.75,['restaurant'])]};}
 };
 const result=await searchGooglePlaces(Place,origin,3000,'restaurant',['kosher']);
 assert.deepEqual(calls,[['nearby',['restaurant']],['text','kosher restaurant']]);
 assert.deepEqual(result.places.map(place=>[place.name,place.foodTypes.includes('kosher')]).sort(),[['Corner Diner',false],['Shalom Grill',true]]);
});
