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
 assert.equal(categoryForOverture({basic_category:'automotive_service',...h('travel_and_transportation','vehicle_service','automotive_service','car_wash')}),'carwash','car washes have their own category');
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
test('kosher listings match certified places by name and location only',async()=>{
 const {kosherListingFor,KOSHER_PLACES}=await import('../public/kosher-places.js');
 const {matchesFoodTypes,foodTypesFromTerms}=await import('../public/food-types.js');
 const at=(name,lat,lng,category='restaurant')=>({id:name,name,lat,lng,category,foodTypes:[]});
 assert.equal(kosherListingFor(at("Dunkin'",39.36227,-76.71118,'coffee'))?.agency,'Star-D');
 assert.equal(kosherListingFor(at("Dunkin'",39.40,-76.70,'coffee')),null,'other Dunkin locations are not certified');
 assert.equal(kosherListingFor(at("Mama Leah's Pizza",39.37648,-76.72610)).name,"Mama Leah's");
 assert.equal(kosherListingFor(at('Taam Thai Sushi and Asian Fusion',39.37671,-76.72639)),null,'same building, different name');
 assert.ok(matchesFoodTypes(at('Seven Mile Market',39.36571,-76.71270,'grocery'),['kosher']));
 assert.ok(matchesFoodTypes(at('Some Corner Store',39.36571,-76.71270,'grocery'),['kosher'])===false);
 assert.ok(matchesFoodTypes({...at('Corner Pizza',40,-75),myKosher:true},['kosher']),'a personal mark counts');
 assert.ok(matchesFoodTypes({...at('Corner Pizza',40,-75),osmKosher:true},['kosher']),'an OpenStreetMap match counts');
 assert.ok(matchesFoodTypes({...at('Corner Pizza',40,-75),myDiets:['halal','vegan']},['halal','vegan']),'details a person added count');
 assert.ok(matchesFoodTypes({...at('Corner Pizza',40,-75),myDiets:['nonsense']},['halal'])===false,'unknown added details are ignored');
 for(const name of ['Glatt Grill','Shalom Bakery Cholov Yisroel','Mangal Grill Express Kosher STAR K'])assert.deepEqual(foodTypesFromTerms([],name),['kosher'],name);
 assert.ok(KOSHER_PLACES.every(entry=>entry.source.startsWith('https://')&&Number.isFinite(entry.lat)&&Number.isFinite(entry.lng)&&entry.address));
});
test('print, design & ship, laundry, pet care, and repair have their own categories',async()=>{
 const {googleSearchGroups,CATEGORY_TEXT_SEARCHES,searchGooglePlaces}=await import('../public/google-places.js');
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'printing_service',...h('services_and_business','printing_service')}),'print');
 assert.equal(categoryForOverture({basic_category:'shipping_center',...h('services_and_business','shipping_or_delivery_service','shipping_center')}),null,'shipping centers include lockers and drop boxes');
 assert.equal(categoryForOverture({basic_category:'graphic_designer',...h('services_and_business','design_service','graphic_designer')}),'print','graphic designers such as Speedy Graphic count');
 assert.equal(categoryForOverture({basic_category:'post_office',...h('services_and_business','shipping_or_delivery_service','post_office')}),null,'post offices stay out');
 assert.equal(categoryForOverture({basic_category:'courier_and_delivery_service',...h('services_and_business','shipping_or_delivery_service','courier_and_delivery_service')}),null,'parcel lockers stay out');
 assert.equal(categoryForOverture({basic_category:'dry_cleaning',...h('services_and_business','laundry_service','dry_cleaning')}),'laundry');
 assert.equal(categoryForOverture({basic_category:'veterinarian',...h('lifestyle_services','animal_or_pet_service','veterinary_care','veterinarian')}),'pets');
 assert.equal(categoryForOverture({basic_category:'pet_store',...h('shopping','specialty_store','animal_and_pet_store','pet_store')}),'other','pet stores stay in More stores');
 assert.equal(categoryForOverture({basic_category:'mobile_phone_repair',...h('services_and_business','technical_service','it_service_and_computer_repair','mobile_phone_repair')}),'repair');
 assert.equal(categoryForOverture({basic_category:'shoe_repair',...h('lifestyle_services','personal_or_beauty_service','shoe_repair')}),'repair');
 assert.equal(categoryForOverture({basic_category:'it_consultant',...h('services_and_business','technical_service','it_service_and_computer_repair','it_consultant')}),null);
 assert.equal(categoryForOverture({basic_category:'automotive_repair',...h('travel_and_transportation','vehicle_service','automotive_service','automotive_repair')}),'auto');
 assert.equal(categoryFor({shop:'copyshop'}),'print');assert.equal(categoryFor({amenity:'post_office'}),'other');assert.equal(categoryFor({shop:'dry_cleaning'}),'laundry');assert.equal(categoryFor({amenity:'veterinary'}),'pets');assert.equal(categoryFor({craft:'tailor'}),'repair');
 assert.equal(googleCategory(['laundry']),'laundry');assert.equal(googleCategory(['veterinary_care']),'pets');assert.deepEqual(googleSearchGroups('print'),[]);
 assert.deepEqual(googleSearchGroups('repair'),[]);assert.deepEqual(googleSearchGroups('laundry'),[['laundry']]);assert.equal(googleSearchGroups('all').length,5);
 const calls=[];const raw=(id,name,types)=>({id,displayName:name,location:{lat:30.275,lng:-97.752},types,primaryType:types[0],businessStatus:'OPERATIONAL'});
 const Place={searchNearby:async r=>{calls.push(['nearby',r.includedTypes]);return {places:[]};},searchByText:async r=>{calls.push(['text',r.textQuery]);assert.ok(r.locationRestriction&&r.locationRestriction.north>origin.lat);return {places:r.textQuery==='print shop'?[raw('ace','Ace Printing',['point_of_interest','store']),raw('lib','Central Library',['library','point_of_interest']),raw('rx','Corner Pharmacy',['pharmacy','store'])]:[raw('speedy','Speedy Graphic',['point_of_interest'])]};}};
 const result=await searchGooglePlaces(Place,origin,3000,'print');
 assert.deepEqual(calls,CATEGORY_TEXT_SEARCHES.print.map(query=>['text',query]));
 assert.deepEqual(result.places.map(place=>[place.name,place.category]).sort(),[['Ace Printing','print'],['Corner Pharmacy','pharmacy'],['Speedy Graphic','print']]);
 for(const [name,category,type] of [['FedEx Office Print & Ship Center','print','corporate'],['FedEx OnSite','print','corporate'],['The UPS Store','print','corporate'],['Minuteman Press','print','corporate'],['Sir Speedy','print','corporate'],['PIP Printing','print','corporate'],['Banfield Pet Hospital','pets','corporate'],['Camp Bow Wow','pets','pe'],['uBreakiFix by Asurion','repair','corporate'],['Tide Cleaners','laundry','corporate'],['Lapels Cleaners','laundry','pe'],['Martinizing Cleaners','laundry','pe']])assert.equal(ownershipFor(p(name,category)).type,type,name);
 assert.equal(ownershipFor(p('VCA','restaurant')).type,'unknown');assert.equal(ownershipFor(p('Pip Squeak Daycare','pets')).type,'unknown');assert.equal(ownershipFor(p('CPR Training Center','repair')).type,'unknown');
});
test('round 1: dentists, urgent care and clinics, and eye care are health categories',async()=>{
 const {googleSearchGroups,CATEGORY_TEXT_SEARCHES}=await import('../public/google-places.js');
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'general_dentistry',...h('health_care','outpatient_care_facility','dental_clinic','general_dentistry')}),'dental');
 assert.equal(categoryForOverture({basic_category:'b2b_dental_lab',...h('services_and_business','b2b_service','b2b_medical_support_service','b2b_dental_lab')}),null,'dental labs are not offices');
 assert.equal(categoryForOverture({basic_category:'urgent_care_clinic',...h('health_care','emergency_or_urgent_care_facility','urgent_care_clinic')}),'clinic');
 assert.equal(categoryForOverture({basic_category:'family_practice',...h('health_care','outpatient_care_facility','primary_care_or_general_clinic','family_practice')}),'clinic');
 assert.equal(categoryForOverture({basic_category:'public_health_clinic',...h('health_care','outpatient_care_facility','primary_care_or_general_clinic','public_health_clinic')}),null);
 assert.equal(categoryForOverture({basic_category:'ambulance_or_ems_service',...h('health_care','emergency_or_urgent_care_facility','ambulance_or_ems_service')}),null);
 assert.equal(categoryForOverture({basic_category:'optometry',...h('health_care','outpatient_care_facility','vision_or_eye_care_clinic','optometry')}),'eye');
 assert.equal(categoryForOverture({basic_category:'eyewear_store',...h('shopping','fashion_and_apparel_store','eyewear_store')}),'eye','eyewear stores move from Clothing');
 assert.equal(categoryFor({amenity:'dentist'}),'dental');assert.equal(categoryFor({amenity:'doctors'}),'clinic');assert.equal(categoryFor({shop:'optician'}),'eye');
 assert.equal(googleCategory(['dentist','doctor','health']),'dental');assert.equal(googleCategory(['doctor']),'clinic');
 assert.deepEqual(googleSearchGroups('dental'),[['dentist','dental_clinic']]);assert.deepEqual(googleSearchGroups('eye'),[]);assert.ok(CATEGORY_TEXT_SEARCHES.eye.length);
 assert.equal(CATEGORIES.find(c=>c.id==='pharmacy').group,'Health');
 for(const [name,category,type] of [['Sunglass Hut','eye','corporate'],['Eyemart Express','eye','corporate'],['LensCrafters','eye','corporate'],['MyEyeDr.','eye','pe'],['Heartland Dental','dental','pe'],['Aspen Dental','dental','pe']])assert.equal(ownershipFor(p(name,category)).type,type,name);
 assert.equal(ownershipFor(p('Heartland Dental','restaurant')).type,'unknown');
});
test('round 2: hotels match by brand family, and only hotels use leading-name matching',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'hotel',...h('lodging','hotel')}),'hotel');
 assert.equal(categoryForOverture({basic_category:'motel',...h('lodging','hotel','motel')}),'hotel');
 assert.equal(categoryForOverture({basic_category:'lodge',...h('lodging','lodge')}),null,'fraternal lodges are not hotels');
 assert.equal(categoryForOverture({basic_category:'lodging',...h('lodging')}),null);
 assert.equal(categoryFor({tourism:'hotel'}),'hotel');
 const at=(name,category='hotel')=>ownershipFor(p(name,category));
 for(const [name,brand] of [['Holiday Inn Express & Suites Owings Mills','IHG'],['DoubleTree by Hilton Hotel Baltimore North','Hilton'],['Hampton Inn Baltimore','Hilton'],['Comfort Inn & Suites Baltimore','Choice Hotels'],['Days Inn by Wyndham Baltimore West','Wyndham'],['Residence Inn by Marriott','Marriott'],['Motel 6 Baltimore','Motel 6']])assert.equal(at(name).brand,brand,name);
 assert.equal(ownershipFor({...p('Baltimore Marriott Waterfront','hotel'),brand:'Marriott Hotels'}).brand,'Marriott');
 assert.equal(at('Courtyard Inn of Pikesville').type,'unknown','a bare Courtyard name is not Marriott');
 assert.equal(at('Hilton Pharmacy','pharmacy').type,'unknown');assert.equal(at('Hampton Roads Diner','restaurant').type,'unknown');
 assert.equal(at('Holiday Stationstores','gas').brand,'Holiday Stationstores');
 assert.equal(at('Hampton Inn Baltimore').localOperators,'franchise');
});
test('round 3: movies & fun covers theaters, bowling, arcades, and parks',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'movie_theater',...h('arts_and_entertainment','movie_theater')}),'fun');
 assert.equal(categoryForOverture({basic_category:'bowling_alley',...h('sports_and_recreation','sport_or_fitness_facility','bowling_alley')}),'fun');
 assert.equal(categoryForOverture({basic_category:'escape_room',...h('arts_and_entertainment','gaming_venue','escape_room')}),'fun');
 assert.equal(categoryFor({amenity:'cinema'}),'fun');assert.equal(categoryFor({leisure:'bowling_alley'}),'fun');
 assert.equal(googleCategory(['movie_theater']),'fun');
 for(const [name,brand] of [['AMC Owings Mills 17','AMC Theatres'],['Cinemark Towson and XD','Cinemark'],['Bowlero Normandy','Lucky Strike'],['AMF Woodlawn Lanes','Lucky Strike'],['Lucky Strike Pikesville','Lucky Strike'],['Six Flags America','Six Flags']])assert.equal(ownershipFor(p(name,'fun')).brand,brand,name);
 assert.equal(ownershipFor(p('AMF Bakery','grocery')).type,'unknown');assert.equal(ownershipFor(p('Lucky Strike Diner','restaurant')).type,'unknown');
});
test('round 4: child care and tutoring, with leading-name matching for school chains',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'day_care_preschool',...h('services_and_business','family_service','child_care_and_day_care','day_care_preschool')}),'childcare');
 assert.equal(categoryForOverture({basic_category:'tutoring_service',...h('education','educational_service','tutoring_service')}),'childcare');
 assert.equal(categoryForOverture({basic_category:'school',...h('education','place_of_learning','school')}),null,'schools stay out');
 assert.equal(categoryFor({amenity:'childcare'}),'childcare');assert.equal(categoryFor({amenity:'kindergarten'}),'childcare');
 for(const [name,brand,type] of [['KinderCare of Owings Mills','KinderCare','corporate'],['Primrose School of Owings Mills','Primrose Schools','pe'],['The Goddard School of Pikesville','The Goddard School','pe'],['Mathnasium of Pikesville','Mathnasium','pe'],['Sylvan Learning Center of Towson','Sylvan Learning','pe'],['The Learning Experience - Reisterstown','The Learning Experience','pe'],['Kiddie Academy of Owings Mills','Kiddie Academy','corporate']])assert.deepEqual([ownershipFor(p(name,'childcare')).brand,ownershipFor(p(name,'childcare')).type],[brand,type],name);
 const kiddie=ownershipFor(p('Kiddie Academy of Owings Mills','childcare'));
 assert.equal(kiddie.headquarters.city,'Abingdon');assert.equal(kiddie.localOperators,'franchise');
 assert.equal(ownershipFor(p('Primrose Garden Center','home')).type,'unknown');
});
test('round 5: storage & rentals and tax & money services',async()=>{
 const {googleSearchGroups}=await import('../public/google-places.js');
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'self_storage_facility',...h('services_and_business','storage_facility','self_storage_facility')}),'storage');
 assert.equal(categoryForOverture({basic_category:'truck_rental_service',...h('services_and_business','rental_service','vehicle_rental_service','truck_rental_service')}),'storage');
 assert.equal(categoryForOverture({basic_category:'package_locker',...h('services_and_business','storage_facility','package_locker')}),null,'parcel lockers stay out');
 assert.equal(categoryForOverture({basic_category:'tax_service',...h('services_and_business','financial_service','tax_service')}),'money');
 assert.equal(categoryForOverture({'@name':'Coinstar Kiosk - Bitcoin ATM',basic_category:'money_transfer_service',...h('services_and_business','financial_service','money_transfer_service')}),null,'kiosks are not businesses');
 assert.equal(categoryFor({shop:'storage_rental'}),'storage');assert.equal(categoryFor({amenity:'money_transfer'}),'money');
 assert.deepEqual(googleSearchGroups('storage'),[['storage','car_rental']]);assert.deepEqual(googleSearchGroups('money'),[]);
 for(const [name,category,brand] of [['Public Storage','storage','Public Storage'],['Life Storage','storage','Extra Space Storage'],['U-Haul Moving & Storage of Owings Mills','storage','U-Haul'],['Enterprise Rent-A-Car','storage','Enterprise Rent-A-Car'],['H&R Block','money','H&R Block'],['Jackson Hewitt Tax Service','money','Jackson Hewitt'],['Western Union','money','Western Union']])assert.equal(ownershipFor(p(name,category)).brand,brand,name);
 assert.equal(ownershipFor(p('U-Haul Neighborhood Dealer','storage')).localOperators,'dealer');
 assert.equal(CATEGORIES.find(c=>c.id==='clinic').name,'Doctors & urgent care');
});
test('round 6: real estate & insurance, with whole-word name matching for agent listings',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'real_estate_agent',...h('services_and_business','real_estate_service','real_estate_agent')}),'realestate');
 assert.equal(categoryForOverture({basic_category:'auto_insurance',...h('services_and_business','financial_service','insurance_agency','auto_insurance')}),'realestate');
 assert.equal(categoryForOverture({basic_category:'home_developer',...h('services_and_business','real_estate_service','builder','home_developer')}),null,'builders stay out');
 assert.equal(categoryFor({office:'estate_agent'}),'realestate');assert.equal(categoryFor({office:'insurance'}),'realestate');
 for(const [name,brand] of [['Bryant Jenkins - State Farm Insurance Agent','State Farm'],['Kathy Hubbard, RE/MAX Advantage','RE/MAX'],['Coldwell Banker Realty - Pikesville','Coldwell Banker'],['CENTURY 21 New Millennium','Century 21']])assert.equal(ownershipFor(p(name,'realestate')).brand,brand,name);
 for(const [name,category] of [['New Era Realty','realestate'],['Compass Property Management','realestate'],['Compass Coffee','coffee'],['State Farm Road Deli','restaurant'],['Century 21 Liquors','other']])assert.equal(ownershipFor(p(name,category)).type,'unknown',name);
 assert.equal(ownershipFor(p('Bryant Jenkins - State Farm Insurance Agent','realestate')).localOperators,'dealer');
});
test('round 7: car dealers move out of More stores into their own category',async()=>{
 const {storeTypeFromTerms}=await import('../public/store-types.js');
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'auto_dealer',...h('shopping','vehicle_dealer','auto_dealer')}),'cars');
 assert.equal(categoryForOverture({basic_category:'used_auto_dealer',...h('shopping','vehicle_dealer','auto_dealer','used_auto_dealer')}),'cars');
 assert.equal(categoryForOverture({basic_category:'auto_parts_store',...h('shopping','specialty_store','vehicle_parts_store','auto_parts_store')}),'other');
 assert.equal(storeTypeFromTerms(['auto_dealer']),'other','dealers are no longer a More stores type');
 assert.equal(categoryFor({shop:'car'}),'cars');assert.equal(googleCategory(['car_dealer']),'cars');
 for(const [name,brand] of [['CarMax','CarMax'],['AutoNation Toyota Hunt Valley','AutoNation'],['AutoNation USA Pikesville','AutoNation'],['Lithia Toyota of Baltimore','Lithia'],['Carvana Car Vending Machine','Carvana']])assert.equal(ownershipFor(p(name,'cars')).brand,brand,name);
 assert.equal(ownershipFor(p('Lithia Springs Diner','restaurant')).type,'unknown');
});
test('round 8: phone & internet stores, with wireless brands guarded to store listings',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'mobile_phone_store',...h('shopping','specialty_store','electronics_store','mobile_phone_store')}),'phone');
 assert.equal(categoryForOverture({basic_category:'mobile_phone_repair',...h('services_and_business','technical_service','it_service_and_computer_repair','mobile_phone_repair')}),'repair','repair shops stay in Repair');
 assert.equal(categoryFor({shop:'mobile_phone'}),'phone');assert.equal(googleCategory(['cell_phone_store']),'phone');
 for(const [name,brand] of [['Verizon - Owings Mills','Verizon'],['AT&T Store','AT&T'],['T-Mobile Pikesville','T-Mobile'],['Cricket Wireless Authorized Retailer','Cricket Wireless'],['Xfinity Store by Comcast','Xfinity'],['Spectrum Store','Spectrum']])assert.equal(ownershipFor(p(name,'phone')).brand,brand,name);
 assert.equal(ownershipFor(p('Cricket Wireless Authorized Retailer','phone')).localOperators,'dealer');
 assert.equal(ownershipFor(p('Spectrum Pediatrics','clinic')).type,'unknown');assert.equal(ownershipFor(p('Verizon','other')).brand,'Verizon');
});
test('round 9: physical therapy & chiropractic, with Select Medical now private equity owned',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'physical_therapy',...h('health_care','outpatient_care_facility','physical_medicine_and_rehabilitation','physical_therapy')}),'therapy');
 assert.equal(categoryForOverture({basic_category:'chiropractic',...h('health_care','outpatient_care_facility','complementary_and_alternative_medicine','chiropractic')}),'therapy');
 assert.equal(categoryForOverture({basic_category:'addiction_rehabilitation_center',...h('health_care','outpatient_care_facility','physical_medicine_and_rehabilitation','rehabilitation_center','addiction_rehabilitation_center')}),'mental','addiction treatment goes to Mental health & addiction, not therapy');
 assert.equal(categoryFor({healthcare:'physiotherapist'}),'therapy');assert.equal(googleCategory(['chiropractor']),'therapy');
 for(const [name,brand,type] of [['Select Physical Therapy - Owings Mills','Select Physical Therapy','pe'],['NovaCare Rehabilitation','Select Physical Therapy','pe'],['ATI Physical Therapy','ATI Physical Therapy','pe'],['The Joint Chiropractic','The Joint Chiropractic','corporate'],['Ivy Rehab Physical Therapy','Ivy Rehab','pe']])assert.deepEqual([ownershipFor(p(name,'therapy')).brand,ownershipFor(p(name,'therapy')).type],[brand,type],name);
 assert.equal(ownershipFor(p('The Joint Chiropractic','therapy')).localOperators,'franchise');
 assert.equal(ownershipFor(p('The Joint Bar & Grill','bar')).type,'unknown');
});
test('round 10: senior living & home care and funeral homes',()=>{
 const h=(...terms)=>({taxonomy:JSON.stringify({hierarchy:terms})});
 assert.equal(categoryForOverture({basic_category:'assisted_living_facility',...h('services_and_business','housing_or_property_service','senior_living_facility','assisted_living_facility')}),'senior');
 assert.equal(categoryForOverture({basic_category:'home_health_care',...h('health_care','medical_service','home_health_care')}),'senior');
 assert.equal(categoryForOverture({basic_category:'senior_citizen_service',...h('community_and_government','social_or_community_service','senior_citizen_service')}),null,'government senior centers stay out');
 assert.equal(categoryForOverture({basic_category:'funeral_service',...h('services_and_business','family_service','funeral_service')}),'funeral');
 assert.equal(categoryForOverture({basic_category:'pet_cemetery_and_crematorium_service',...h('lifestyle_services','animal_or_pet_service','pet_cemetery_and_crematorium_service')}),'pets','pet cemeteries stay with pet care');
 assert.equal(categoryFor({shop:'funeral_directors'}),'funeral');assert.equal(categoryFor({amenity:'social_facility',social_facility:'assisted_living'}),'senior');assert.equal(googleCategory(['funeral_home']),'funeral');
 for(const [name,category,brand] of [['Brookdale Pikesville','senior','Brookdale'],['Home Instead','senior','Home Instead'],['Ruck Funeral Home - Dignity Memorial','funeral','Dignity Memorial'],['Neptune Society','funeral','Dignity Memorial'],['Sharonda Benson: Allstate Insurance','realestate','Allstate']])assert.equal(ownershipFor(p(name,category)).brand,brand,name);
 assert.equal(ownershipFor(p('Allstate Leasing','cars')).type,'unknown','Allstate only matches insurance and real estate listings');
});
test('hospitals: category and facility-level tracker matches',()=>{
 const h=(basic,name,...terms)=>({basic_category:basic,'@name':name,taxonomy:JSON.stringify({primary:basic,hierarchy:terms})});
 assert.equal(categoryForOverture(h('hospital','National Park Medical Center','health_care','hospital')),'hospital');
 assert.equal(categoryForOverture(h('outpatient_care_facility','Mercy Hospital Hot Springs','health_care','outpatient_care_facility')),'hospital');
 for(const name of ['MedExpress Urgent Care','Hayder Abbood, MD','Mercy Hospital Parking Department','University of Maryland Hospital Pediatrics','Hot Springs National Park Hospital Holdings Llc','Vanderbilt Children\'s Hospital Ambulance Entrance','Center for Cognitive Medicine at Vanderbilt University Medical Center'])assert.notEqual(categoryForOverture(h('hospital',name,'health_care','hospital')),'hospital',name);
 assert.equal(categoryForOverture(h('diagnostics_imaging_or_lab_service','Ascension Saint Agnes Hospital Diabetes Care','health_care','outpatient_care_facility')),null);
 assert.equal(categoryFor({amenity:'hospital'}),'hospital');assert.equal(googleCategory(['hospital']),'hospital');assert.ok(PLACE_CATEGORIES.includes('hospital'));
 const hot={lat:34.48,lng:-93.06};
 const npmc=ownershipFor({id:'a',name:'National Park Medical Center',category:'hospital',addressCity:'Hot Springs',...hot});
 assert.equal(npmc.type,'pe');assert.match(npmc.parent,/Lifepoint Health · Apollo/);assert.equal(npmc.matchLevel,'facility');
 assert.equal(ownershipFor({id:'b',name:'National Park Medical Center',category:'hospital',address:'1910 Malvern Ave, Hot Springs, AR 71901, USA',addressCity:'',...hot}).type,'pe','Google formatted address');
 assert.equal(ownershipFor({id:'c',name:'National Park Medical Center',category:'hospital',addressCity:'Little Rock',...hot}).type,'unknown','city must agree');
 assert.equal(ownershipFor({id:'d',name:'National Park Medical Center',category:'clinic',addressCity:'Hot Springs',...hot}).type,'unknown','only hospital listings use the tracker');
 assert.equal(ownershipFor({id:'e',name:'Sinai Hospital of Baltimore',category:'hospital',addressCity:'Baltimore',lat:39.35,lng:-76.66}).type,'unknown','nonprofit hospitals stay unknown');
});
test('PE employer tracker leads: verified storefront brands',()=>{
 for(const [name,category,brand,type] of [['Extended Stay America Suites - Baltimore - BWI Airport','hotel','Extended Stay America','pe'],['Topgolf Baltimore','fun','Topgolf','pe'],['Bright Now! Dental','dental','Bright Now! Dental','pe'],['Athletico Physical Therapy - Towson','therapy','Athletico Physical Therapy','pe'],['La Petite Academy of Owings Mills','childcare','La Petite Academy','pe'],['SEA LIFE Michigan Aquarium','fun','SEA LIFE','pe'],['Pret A Manger','coffee','Pret A Manger','corporate'],['Interim HealthCare of Baltimore','senior','Interim HealthCare','pe']]){const o=ownershipFor(p(name,category));assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
 assert.equal(ownershipFor(p('LEGO Store','other')).brand===undefined||ownershipFor(p('LEGO Store','other')).brand!=='LEGOLAND Discovery Center',true);
});
test('round 13: car washes, labs & imaging, hearing care, and trailing descriptors',()=>{
 const h=(basic,name,...terms)=>({basic_category:basic,'@name':name,taxonomy:JSON.stringify({primary:basic,hierarchy:terms})});
 assert.equal(categoryForOverture(h('car_wash','Mister Car Wash','services_and_business','automotive_service','car_wash')),'carwash');
 assert.equal(categoryForOverture(h('auto_detailing','Detail Pros','services_and_business','automotive_service','auto_detailing')),'auto');
 assert.equal(categoryForOverture(h('laboratory_testing','Quest Diagnostics','health_care','laboratory_testing')),'lab');
 assert.equal(categoryForOverture(h('laboratory_testing','Smile Dental Lab','health_care','laboratory_testing')),null,'dental labs stay out');
 assert.equal(categoryForOverture(h('hearing_aid_store','Miracle-Ear','shopping','specialty_store','hearing_aid_store')),'hearing');
 assert.equal(categoryForOverture(h('trusts','H&R Block','services_and_business','financial_service','trusts')),'money');
 assert.equal(categoryForOverture(h('trusts','Smith Family Trust','services_and_business','financial_service','trusts')),null);
 assert.equal(categoryFor({amenity:'car_wash'}),'carwash');assert.equal(categoryFor({healthcare:'laboratory'}),'lab');assert.equal(categoryFor({shop:'hearing_aids'}),'hearing');
 assert.equal(googleCategory(['car_wash']),'carwash');assert.equal(googleCategory(['car_repair']),'auto');
 for(const [name,category,brand] of [['Olive Garden Italian Restaurant','restaurant','Olive Garden'],['Pep Boys Auto Service & Tires','auto','Pep Boys'],['Kroger Pharmacy','pharmacy','Kroger'],['Sunoco Gas Station','gas','Sunoco'],['CubeSmart Self Storage','storage','CubeSmart'],['Hand and Stone Massage and Facial Spa','beauty','Hand & Stone Massage and Facial Spa'],['Quick Quack Car Wash','carwash','Quick Quack Car Wash'],['Quest Diagnostics','lab','Quest Diagnostics'],['HearUSA','hearing','HearUSA'],['Tommy Bahama Restaurant & Bar','restaurant','Tommy Bahama'],['Jane Doe - Nationwide Insurance','realestate','Nationwide']])assert.equal(ownershipFor(p(name,category)).brand,brand,name);
 assert.equal(ownershipFor(p('Express','apparel')).brand,'Express','a brand that is itself a descriptor still matches');
 assert.equal(ownershipFor(p('Main Street Restaurant','restaurant')).type,'unknown');
});
test('round 13: generic names stay unmatched',()=>{
 for(const [name,category] of [['Lash Lounge By LeahJ','beauty'],['Gallagher Realty','realestate'],["Leslie's Furniture",'home'],['Ryder Auto Body','auto']])assert.equal(ownershipFor(p(name,category)).type,'unknown',name);
});
test('nationwide gap round: new chains, name variants, and guards',()=>{
 for(const [name,category,brand] of [['Krispy Krunchy Chicken','restaurant','Krispy Krunchy Chicken'],['Hunt Brothers Pizza','restaurant','Hunt Brothers Pizza'],['Hanger Clinic: Prosthetics & Orthotics','therapy','Hanger Clinic'],['Kroger Fuel Center','gas','Kroger'],['Santander Bank Branch','bank','Santander Bank'],['Suntrust','bank','Truist'],['Mr. Tire Auto Service Centers','auto','Monro Auto Service and Tire Centers'],['Speedco Truck Lube and Tires','auto','Love’s Travel Stops'],['Best Western Plus Baltimore','hotel','Best Western'],['Jane Doe - Keller Williams Realty','realestate','Keller Williams'],["Casey's",'restaurant','Casey’s']])assert.equal(ownershipFor(p(name,category)).brand,brand,name);
 assert.equal(ownershipFor(p('Best Western','hotel')).type,'independent','Best Western hotels are member-owned');
 assert.equal(ownershipFor(p('Good Neighbor Pharmacy','pharmacy')).type,'independent');
 for(const [name,category] of [["Clark's Shoes",'apparel'],['Ferguson Hardware','home'],['Red Wing','apparel'],['Gas Station','gas']])assert.equal(ownershipFor(p(name,category)).type,'unknown',name);
});
test('car makes match dealer listings only, with the dealer badge',()=>{
 for(const [name,brand] of [['Koons Toyota of Annapolis','Toyota'],['Heritage Honda Westminster','Honda'],['Jerry\'s Ford','Ford'],['Antwerpen Hyundai','Hyundai'],['Tesla Showroom','Tesla']]){const o=ownershipFor(p(name,'cars'));assert.equal(o.brand,brand,name);}
 assert.equal(ownershipFor(p('Heritage Honda Westminster','cars')).localOperators,'dealer');
 for(const [name,category] of [['Toyota Specialist Auto Repair','auto'],['Lincoln Auto Sales','cars'],['Dodge City Motors','cars'],['Genesis Auto Group','cars'],['Tesla Collision','auto']])assert.equal(ownershipFor(p(name,category)).type,'unknown',name);
});
test('home services category and franchise platforms',()=>{
 const h=(basic,name,...terms)=>({basic_category:basic,'@name':name,taxonomy:JSON.stringify({primary:terms.at(-1),hierarchy:terms})});
 assert.equal(categoryForOverture(h('home_service','Benjamin Franklin Plumbing','services_and_business','home_service','plumbing')),'homeservices');
 assert.equal(categoryForOverture(h('home_service','Terminix','services_and_business','home_service','pest_control_service')),'homeservices');
 for(const name of ['savon contracting inc','Pikesville Volunteer Fire','Mehta Consultants Inc'])assert.equal(categoryForOverture(h('home_service',name,'services_and_business','home_service',name==='savon contracting inc'?'contractor':name.includes('Fire')?'fire_protection_service':'structural_engineer')),null,name);
 assert.equal(categoryForOverture(h('home_service','B & K Custom Tailors','services_and_business','home_service','sewing_and_alterations','tailor')),'repair','tailors stay in repair');
 assert.equal(categoryFor({craft:'plumber'}),'homeservices');assert.equal(googleCategory(['plumber']),'homeservices');
 for(const [name,brand,type] of [['Mr. Rooter Plumbing of Baltimore','Mr. Rooter Plumbing','pe'],['Benjamin Franklin Plumbing','Benjamin Franklin Plumbing','pe'],['SERVPRO of Northwest Baltimore County','SERVPRO','pe'],['Rainbow Restoration of Owings Mills','Rainbow Restoration','pe'],['Certapro Painters Of Owings Mills / Westminster','CertaPro Painters','corporate'],['Terminix','Terminix','corporate'],['1-800 WATER DAMAGE of Northwest Baltimore','1-800 WATER DAMAGE','pe'],['Mr. Appliance of Owings Mills','Mr. Appliance','pe']]){const o=ownershipFor(p(name,'homeservices'));assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
 for(const name of ['Paul Davis Plumbing','ARS Roofing','Precision Garage Door Repair'])assert.equal(ownershipFor(p(name,'homeservices')).type,'unknown',name);
});
test('specialist doctors, mental health, and equipment rental',()=>{
 const h=(basic,name,...terms)=>({basic_category:basic,'@name':name,taxonomy:JSON.stringify({primary:terms.at(-1),hierarchy:terms})});
 assert.equal(categoryForOverture(h('specialized_health_care','Maryland Cardiovascular Specialists','health_care','specialized_health_care','internal_medicine','cardiology')),'specialists');
 assert.equal(categoryForOverture(h('specialized_health_care','Linda M Lang Md','health_care','specialized_health_care','internal_medicine')),'clinic','plain internal medicine stays primary care');
 assert.equal(categoryForOverture(h('surgery','The Maryland Center for Oral Surgery','health_care','surgery','oral_and_maxillofacial_surgery')),'dental','oral surgery stays with dentists');
 assert.equal(categoryForOverture(h('behavioral_or_mental_health_clinic','Resilient Life Counseling','health_care','behavioral_or_mental_health_clinic','counseling')),'mental');
 assert.equal(categoryForOverture(h('rental_service','Aggreko Rental','services_and_business','rental_service','machine_and_tool_rental')),'storage');
 assert.equal(categoryFor({healthcare:'psychotherapist'}),'mental');
 for(const [name,category,brand,type] of [['National Spine & Pain Centers - Pikesville','specialists','National Spine & Pain Centers','pe'],['Forefront Dermatology Baltimore','specialists','Forefront Dermatology','pe'],['GI Alliance','specialists','GI Alliance','corporate'],['Thriveworks Counseling & Psychiatry Towson','mental','Thriveworks','pe'],['United Rentals','storage','United Rentals','corporate']]){const o=ownershipFor(p(name,category));assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
});
test('round 16: dental support groups, Sonesta economy hotels, banks, and name variants',()=>{
 for(const [name,category,brand,type] of [['Affordable Dentures & Implants','dental','Affordable Dentures & Implants','pe'],['Western Dental & Orthodontics','dental','Western Dental','pe'],['Americas Best Value Inn Baltimore','hotel','Americas Best Value Inn','corporate'],['BenchMark Physical Therapy','therapy','Upstream Rehabilitation','pe'],['Bank of the West','bank','BMO','corporate'],['The Medicine Shoppe Pharmacy','pharmacy','The Medicine Shoppe','corporate']]){const o=ownershipFor(p(name,category));assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
 assert.equal(ownershipFor({id:'c',name:'Commerce Bank',category:'bank',lat:39.10,lng:-94.58}).brand,'Commerce Bank','Kansas City');
 assert.equal(ownershipFor({id:'c2',name:'Commerce Bank',category:'bank',lat:40.0,lng:-75.0}).type,'unknown','other banks share the name outside the Midwest');
});
test('Maryland and brand-tag round: local chains, co-ops, insurers, and merged banks',()=>{
 const md=(name,category,brand='')=>({id:name,name,brand,category,lat:39.37,lng:-76.72});
 for(const [name,category,brand,type] of [["High's",'gas',"High's",'corporate'],['Dash In','grocery','Dash In','corporate'],['Roy Rogers','restaurant','Roy Rogers','corporate'],['Ledo Pizza','restaurant','Ledo Pizza','corporate'],['Sandy Spring Bank','bank','Atlantic Union Bank','corporate'],['Old Line Bank','bank','WesBanco','corporate'],['Pivot Physical Therapy','therapy','Athletico Physical Therapy','pe'],['Long & Foster Real Estate','realestate','Long & Foster','corporate'],['Mattress Warehouse','home','Mattress Warehouse','pe'],['SECU Credit Union','bank','SECU Maryland','independent']]){const o=ownershipFor(md(name,category));assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
 assert.ok(ownershipFor(md('Roy Rogers','restaurant')).headquarters,'local corporations carry a headquarters for the How local? slider');
 assert.equal(ownershipFor(md("Gill-Roy's Hardware",'home','Do it Best')).type,'independent','Overture brand tags identify co-op members');
 assert.equal(ownershipFor(md('Jane Doe - Erie Insurance','realestate')).brand,'Erie Insurance');
 assert.equal(ownershipFor({id:'nc',name:'SECU Credit Union',category:'bank',lat:35.78,lng:-78.64}).brand!=='SECU Maryland',true,'Maryland SECU stays in Maryland');
});
test('round 18: regional banks, merged-bank names, and apparel and home brands',()=>{
 for(const [name,category,brand] of [['Great Western Bank','bank','First Interstate Bank'],['Chemical Bank','bank','Huntington Bank'],['IBERIABANK','bank','First Horizon Bank'],['BBVA Compass','bank','PNC Bank'],['Susquehanna Bank','bank','Truist'],['US HealthWorks','clinic','Concentra Urgent Care'],['Just Tires','auto','Goodyear Auto Service'],['PetSmart Grooming','pets','PetSmart'],['Platt Electric Supply','home','Rexel'],['Tommy Hilfiger','apparel','Tommy Hilfiger'],['Renasant Bank','bank','Renasant Bank'],['Jane Doe - Weichert Realtors','realestate','Weichert Realtors']])assert.equal(ownershipFor(p(name,category)).brand,brand,name);
 assert.equal(ownershipFor({id:'f',name:'NASA Federal Credit Union',category:'bank',lat:38.82,lng:-76.75}).type,'independent');
 assert.equal(ownershipFor(p('Garage Door Pros','home')).type,'unknown','Garage clothing only matches its exact name');
});
test('regional scan: state banks, credit unions with state limits, and merged names',()=>{
 const at=(name,category,lat,lng)=>ownershipFor({id:name,name,category,lat,lng});
 assert.equal(at('Frost Bank','bank',29.42,-98.49).brand,'Frost Bank');
 assert.equal(at('Amegy Bank','bank',29.76,-95.37).parent,'Zions Bancorporation, N.A.');
 assert.equal(at('MB Financial Bank','bank',41.88,-87.63).brand,'Fifth Third Bank');
 assert.equal(at('Pacific Western Bank','bank',34.05,-118.24).brand,'Banc of California');
 assert.equal(at('Independent Financial','bank',32.78,-96.8).brand,'SouthState Bank');
 assert.equal(at('Kessler Rehabilitation Center','therapy',40.74,-74.17).brand,'Select Physical Therapy');
 assert.equal(at('VyStar Credit Union','bank',30.33,-81.66).type,'independent');
 assert.equal(at('Five Star Bank','bank',43.0,-77.6).brand,'Five Star Bank','Five Star Bank in New York');
 assert.equal(at('Five Star Bank','bank',38.58,-121.49).type,'unknown','a different Five Star Bank in California');
 assert.equal(at('Independent Bank','bank',42.73,-84.55).type,'unknown','Michigan\'s Independent Bank is a different company');
});
test('family-owned regional chains carry a headquarters and stay in their region',()=>{
 const at=(name,category,lat,lng)=>ownershipFor({id:name,name,category,lat,lng});
 for(const [name,category,lat,lng,brand] of [['United Dairy Farmers','grocery',39.1,-84.5,'United Dairy Farmers'],['Skyline Chili','restaurant',39.1,-84.5,'Skyline Chili'],['Runza Restaurant','restaurant',40.8,-96.7,'Runza'],['Bill Miller Bar-B-Q','restaurant',29.4,-98.5,'Bill Miller Bar-B-Q'],['Mirabito','grocery',42.1,-75.9,'Mirabito'],['Brown Bear Car Wash','carwash',47.6,-122.3,'Brown Bear Car Wash']]){const o=at(name,category,lat,lng);assert.equal(o.brand,brand,name);assert.ok(o.headquarters,name);}
 assert.equal(at('Break Time','grocery',38.95,-92.33).type,'independent','MFA Oil is a farmer-owned cooperative');
 assert.equal(at('Runza','restaurant',39.29,-76.61).type,'unknown','regional names stay in their region');
 assert.equal(at('Certified Oil','grocery',39.96,-83.0).type,'pe');
 assert.equal(at('Great Lakes Ace','home',42.33,-83.05).brand,'Ace Hardware');
});
test('regional batch 2: family chains, sister brands, and Dobbs (Audax)',()=>{
 const at=(name,category,lat,lng)=>ownershipFor({id:name,name,category,lat,lng});
 for(const [name,category,lat,lng,brand,type] of [['Rotten Robbie','gas',37.35,-121.95,'Rotten Robbie','corporate'],['GoMart','grocery',38.35,-81.63,'GoMart','corporate'],['Crew Carwash','carwash',39.77,-86.16,'Crew Carwash','corporate'],["CC's Coffee House",'coffee',30.45,-91.15,"CC's Coffee House",'corporate'],['Dobbs Tire & Auto Centers','auto',38.63,-90.2,'Dobbs Tire & Auto Centers','pe'],["Conrad's Tire Express & Total Car Care",'auto',41.5,-81.7,'Dobbs Tire & Auto Centers','pe'],['True Texas BBQ','restaurant',30.27,-97.74,'H-E-B','corporate'],['Empire Visionworks','eye',40.7,-74.0,'Visionworks','corporate'],["Brookshire's Pharmacy",'pharmacy',32.35,-95.3,'Brookshire’s','corporate']]){const o=at(name,category,lat,lng);assert.equal(o.brand,brand,name);assert.equal(o.type,type,name);}
});

test('Sprouts matches its short name only as a grocery and is listed as publicly traded',()=>{
 const sprouts=ownershipFor({name:'sprouts',category:'grocery',lat:39.27,lng:-76.57});
 assert.equal(sprouts.type,'corporate');assert.equal(sprouts.brand,'Sprouts Farmers Market');
 for(const [name,category] of [['Sprouts','restaurant'],['Sprouts Learning Center','childcare']])assert.equal(ownershipFor({name,category,lat:39.27,lng:-76.57}).type,'unknown',name);
 assert.equal(sprouts.publicListing?.exchanges?.[0]?.ticker,'SFM');
});

test('short listing names match their brands only in the right category or region',()=>{
 const at=(name,category,lat=40,lng=-75)=>ownershipFor({name,category,lat,lng});
 for(const [name,category,brand,lat,lng] of [['Giant Food Stores','grocery','GIANT',40.27,-76.88],['Fairfield','hotel','Marriott'],['Holiday Station','gas','Holiday Stationstores'],['Ashley Furniture','home','Ashley HomeStore'],['Phillips','gas','Phillips 66'],["Stewart's",'gas','Stewart’s Shops',43.08,-73.78],['Caliber','auto','Caliber Collision'],["BJ's",'restaurant',"BJ's Restaurant & Brewhouse"],['Bonanza','restaurant','Bonanza Steakhouse'],['Extended Stay','hotel','Extended Stay America']])assert.equal(at(name,category,lat,lng).brand,brand,name);
 for(const [name,category,lat,lng] of [['Fairfield','restaurant'],['Compass','fitness'],['Caliber','restaurant'],['Bonanza','other'],["Stewart's",'gas',30.3,-97.7]])assert.equal(at(name,category,lat,lng).type,'unknown',name+' in '+category);
});
