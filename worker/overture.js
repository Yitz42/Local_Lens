import {PMTiles,FetchSource} from 'pmtiles';
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {foodTypesFromTerms,foodTypeLabel} from '../public/food-types.js';
import {storeTypeFromTerms} from '../public/store-types.js';
export const RELEASE='2026-10-21.0';
export const DATA_DATE='2026-10-21T00:00:00Z';
export const ARCHIVE_URL=`https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/${RELEASE}/places.pmtiles`;
export const PAGE_SIZE=4;
export const PLACE_FORMAT='carwash-lab-hearing-v1';
const ZOOM=14,N=2**ZOOM;
class BoundedSource extends FetchSource{
 async getBytes(offset,length,signal,etag){
  const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,10000);
  try{return await super.getBytes(offset,length,controller.signal,etag);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
}
const archive=new PMTiles(new BoundedSource(ARCHIVE_URL));
function parse(value,fallback){if(value&&typeof value==='object')return value;try{return JSON.parse(value)||fallback;}catch{return fallback;}}
function taxonomyTerms(properties,includeAlternates=false){const taxonomy=parse(properties.taxonomy,{});return [properties.basic_category,taxonomy.primary,...(Array.isArray(taxonomy.hierarchy)?taxonomy.hierarchy:[]),...(includeAlternates&&Array.isArray(taxonomy.alternates)?taxonomy.alternates:[]),...(includeAlternates&&Array.isArray(taxonomy.alternate)?taxonomy.alternate:[])].filter(term=>typeof term==='string');}
export function categoryForOverture(properties){
 const terms=taxonomyTerms(properties);
 if(terms.some(t=>/^(gas_station|fuel_station|petrol_station)$/.test(t)))return 'gas';
 if(terms.some(t=>/^(coffee_shop|cafe|cafeteria|tea_house|tea_room|bubble_tea_shop|juice_bar|ice_cream_shop)$/.test(t)))return 'coffee';
 if(terms.some(t=>/^(grocery_store|supermarket|convenience_store|bakery|greengrocer|food_market|specialty_food_store|specialty_foods_store|farmers_market|butcher_shop|seafood_market|fishmonger|cheese_shop|health_food_store|herb_and_spice_store|patisserie_cake_shop)$/.test(t)))return 'grocery';
 // Bars are separate unless the venue is also tagged as a restaurant.
 if(terms.some(t=>/^(alcoholic_beverage_venue|bar|pub|lounge|brewery|beer_garden|cocktail_bar|wine_bar|sports_bar|dance_club|nightlife_venue)$/.test(t))&&!terms.some(t=>t.includes('restaurant')))return 'bar';
 if(terms.some(t=>t==='restaurant'||t==='food_and_drink'||t.includes('restaurant')||t==='fast_food'||t==='food_truck'))return 'restaurant';
 if(terms.some(t=>/^(pharmacy_and_drug_store|pharmacy|drugstore)$/.test(t)))return 'pharmacy';
 if(terms.some(t=>/^(hardware_home_and_garden_store|hardware_store|home_improvement_store|building_supply_store|furniture_store|home_goods_store|nursery_and_gardening_store|paint_store)$/.test(t)))return 'home';
 if(terms.some(t=>/^(vehicle_dealer|auto_dealer|used_auto_dealer|car_dealer|motorcycle_dealer|truck_dealer|recreational_vehicle_dealer|motorsport_vehicle_dealer|commercial_vehicle_dealer|auto_leasing)$/.test(t)))return 'cars';
 // Phone and internet stores; phone repair stays in Repair & alterations.
 if(terms.some(t=>/^(mobile_phone_store|mobile_phone_accessory_store|cell_phone_store|telecommunications_service)$/.test(t)))return 'phone';
 if(terms.some(t=>/^(eyewear_store|optician|vision_or_eye_care_clinic|optometry|ophthalmology|optometrist)$/.test(t)))return 'eye';
 if(terms.some(t=>/^(fashion_and_apparel_store|clothing_store|shoe_store)$/.test(t)))return 'apparel';
 if(terms.some(t=>/^(department_store|discount_store|warehouse_club_store)$/.test(t)))return 'general';
 if(terms.some(t=>/^(hearing_aid_store|hearing_aid_provider|hearing_aids|audiologist|audiology)$/.test(t)))return 'hearing';
 if(terms.some(t=>t==='shopping'||t==='retail'))return 'other';
 if(terms.some(t=>/^(beauty_salon|hair_salon|nail_salon|barber|skin_care_and_makeup|hair_removal|waxing|tanning_salon|spa|day_spa|medical_spa|massage_therapy|tattoo_and_piercing|eyelash_service)$/.test(t)))return 'beauty';
 if(terms.some(t=>/^(gym|fitness_studio|yoga_studio|pilates_studio|boxing_gym|boxing_class|boot_camp|fitness_trainer|dance_studio|martial_arts_club|climbing_gym|cycling_studio)$/.test(t)))return 'fitness';
 if(terms.some(t=>/^car_wash$/.test(t)))return 'carwash';
 if(terms.some(t=>/^(automotive_service|automotive_repair|auto_body_shop|tire_dealer_and_repair|tire_shop|auto_detailing|auto_glass_service|oil_change_station)$/.test(t)))return 'auto';
 if(terms.some(t=>/^(bank_or_credit_union|bank|credit_union)$/.test(t)))return 'bank';
 // Print shops, graphic designers, and sign makers. Shipping centers are left out because the label also covers
 // post offices, parcel lockers, and drop boxes.
 if(terms.some(t=>/^(printing_service|screen_printing_service|t_shirt_printing_service|commercial_printer|print_media|copy_shop|graphic_designer|sign_making|signmaking|sign_maker)$/.test(t)))return 'print';
 if(terms.some(t=>/^(laundry_service|laundromat|dry_cleaning|laundry)$/.test(t)))return 'laundry';
 if(terms.some(t=>/^(movie_theater|cinema|drive_in_theater|bowling_alley|arcade|escape_room|amusement_park|trampoline_park|mini_golf|mini_golf_course|laser_tag|go_kart_track|family_entertainment_center)$/.test(t)))return 'fun';
 // Day care, preschool, and tutoring. Schools and colleges stay out.
 if(terms.some(t=>/^(child_care_and_day_care|day_care_preschool|preschool|tutoring_service|test_preparation)$/.test(t)))return 'childcare';
 // Self storage and vehicle rental; parcel lockers and warehouses stay out.
 if(terms.some(t=>/^(self_storage_facility|truck_rental_service|car_rental_service)$/.test(t)))return 'storage';
 // Overture files many tax preparers under 'trusts'; only tax-named listings count.
 if(terms.includes('trusts')&&/\b(tax|h ?& ?r block|jackson hewitt)\b/i.test(properties['@name']||''))return 'money';
 // Coin and Bitcoin kiosks and ATMs are machines, not businesses.
 if(terms.some(t=>/^(tax_service|tax_preparation|money_transfer_service|check_cashing_payday_loans|currency_exchange)$/.test(t)))return /\b(kiosk|atm)\b/i.test(properties['@name']||'')?null:'money';
 // Real estate and insurance agents; builders, investors, surveyors, and associations stay out.
 if(!terms.some(t=>/^(builder|home_developer|real_estate_investment|land_surveying|homeowner_association|housing_cooperative|real_estate_photography|display_home_center|home_organization|shared_office_space)$/.test(t))&&terms.some(t=>/^(real_estate_agent|real_estate_service|property_management|commercial_real_estate|insurance_agency|auto_insurance|life_insurance|home_and_rental_insurance|health_insurance_office)$/.test(t)))return 'realestate';
 if(terms.some(t=>/^(funeral_service|funeral_home|crematorium|cremation_service|cemetery|mortuary)$/.test(t)))return 'funeral';
 // Senior living and in-home care; government senior centers stay out.
 if(terms.some(t=>/^(senior_living_facility|retirement_home|assisted_living_facility|memory_care_facility|nursing_home|skilled_nursing_facility|home_health_care|home_care)$/.test(t)))return 'senior';
 // Hotels and inns. Vacation rentals, campgrounds, 'lodge' (mostly fraternal lodges), and the bare 'lodging'
 // label (often event companies) stay out.
 if(terms.some(t=>/^(hotel|motel|resort|inn|bed_and_breakfast|hostel|guest_house|extended_stay_hotel)$/.test(t)))return 'hotel';
 // Medical labs, imaging centers, and plasma donation; dental labs stay out.
 if([properties.basic_category,parse(properties.taxonomy,{}).primary].some(t=>/^(laboratory_testing|medical_laboratory|diagnostic_imaging|diagnostic_services|blood_and_plasma_donation_center|plasma_donation_center|blood_bank)$/.test(t))&&!/\b(dental|dentistry)\b/i.test(properties['@name']||''))return 'lab';
 // Hospitals. Overture's hospital label also covers many doctors' offices and departments, so the name must read
 // as a hospital or medical center, and offices, departments, and support services inside hospitals stay out.
 if([properties.basic_category,parse(properties.taxonomy,{}).primary].some(t=>/^(hospital|general_hospital|childrens_hospital|psychiatric_hospital|rehabilitation_hospital|specialty_hospital|health_care|outpatient_care_facility|behavioral_or_mental_health_clinic)$/.test(t))&&/\b(hospitals?|medical cent(er|re)|med ctr|infirmary|shock trauma center)\b/i.test(properties['@name']||'')&&!/\b(animal|pet|veterinary|parking|pharmacy|atm|office|building|foundation|auxiliary|gift|cafeteria|clinic|associates|physicians?|group|lab|laboratory|imaging|radiology|ems|liaison|services|holdings|information|wellness|outpatient|out patient|wound|cardiology|neurology|oncology|pediatrics|obgyn|department|div|division|nuclear|pavilion|md|dds|pharmacies|care|unit|floor|entrance|rad|delivery)\b/i.test(properties['@name']||'')&&!/^(center|centre|institute) for\b/i.test(properties['@name']||''))return 'hospital';
 // Physical, occupational, and speech therapy and chiropractic; addiction treatment and prosthetics stay out.
 if(!terms.some(t=>/^(addiction_rehabilitation_center|prosthetics|orthotics)$/.test(t))&&terms.some(t=>/^(physical_therapy|physical_medicine_and_rehabilitation|occupational_therapy|speech_therapy|rehabilitation_center|chiropractic|chiropractor)$/.test(t)))return 'therapy';
 if(terms.some(t=>/^(dental_clinic|dentist|general_dentistry|orthodontics|orthodontist|pediatric_dentistry|cosmetic_dentistry|endodontics|periodontics|prosthodontics|oral_surgeon|oral_and_maxillofacial_surgery)$/.test(t)))return 'dental';
 // Walk-in and primary care. Public health offices, ambulance services, and specialists stay out.
 if(!terms.some(t=>/^(public_health_clinic|ambulance_or_ems_service)$/.test(t))&&terms.some(t=>/^(urgent_care_clinic|walk_in_clinic|emergency_department|emergency_or_urgent_care_facility|primary_care_or_general_clinic|family_practice|pediatric_clinic|internal_medicine)$/.test(t)))return 'clinic';
 if(terms.some(t=>/^(animal_or_pet_service|veterinary_care|veterinarian|animal_hospital|emergency_pet_hospital|pet_care_service|pet_groomer|pet_sitting|pet_boarding|pet_training|dog_trainer|dog_walker)$/.test(t)))return 'pets';
 if(!terms.some(t=>/^(it_consultant|computer_hardware_company)$/.test(t))&&terms.some(t=>/^(it_service_and_computer_repair|mobile_phone_repair|electronics_repair_shop|computer_repair|shoe_repair|watch_repair_service|jewelry_repair_service|sewing_and_alterations|tailor)$/.test(t)))return 'repair';
 return null;
}
export function distance(a,b){const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlng=(b.lng-a.lng)*r;const h=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
export function planTiles(lat,lng,radius){
 const latPad=(radius+120)/111000,lngPad=(radius+120)/(111000*Math.cos(lat*Math.PI/180));
 const tileX=lon=>Math.floor((lon+180)/360*N),tileY=latitude=>{const r=Math.max(-85.0511287,Math.min(85.0511287,latitude))*Math.PI/180;return Math.max(0,Math.min(N-1,Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*N)));};
 const minX=tileX(lng-lngPad),maxX=tileX(lng+lngPad),minY=tileY(lat+latPad),maxY=tileY(lat-latPad),tiles=[];
 if((maxX-minX+1)*(maxY-minY+1)>512)throw new RangeError('Choose a smaller search radius for this area.');
 for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)tiles.push({z:ZOOM,x:((x%N)+N)%N,y});
 return tiles;
}
export function normalizePlace(feature){
 const p=feature.properties||{},category=categoryForOverture(p);
 if(!category||p.operating_status==='permanently_closed'||p.operating_status==='closed')return null;
 const name=p['@name']||parse(p.names,{}).primary,id=String(p.id||'');
 if(!name||!id||!/^[a-zA-Z0-9-]{1,128}$/.test(id)||feature.geometry?.type!=='Point')return null;
 const [lng,lat]=feature.geometry.coordinates;if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const address=parse(p.addresses,[])[0]||{},brand=parse(p.brand,{}).names?.primary||'';
 const websites=parse(p.websites,[]);
 const foodTypes=foodTypesFromTerms([...taxonomyTerms(p,true),p.cuisine||'',parse(p.cuisines,[])]);
 return {id:'overture/'+id,name:String(name),brand:String(brand),lat,lng,category,address:address.freeform||'',addressCity:address.locality||'',website:websites.find(v=>typeof v==='string'&&/^https?:\/\//.test(v))||'',cuisine:foodTypeLabel({foodTypes}),foodTypes,amenity:p.basic_category||'',source:'Overture Maps',release:RELEASE,...(category==='other'?{storeType:storeTypeFromTerms(taxonomyTerms(p))}:{})};
}
export async function lookupPlacesPage(lat,lng,radius,page=0,source=archive){
 const tiles=planTiles(lat,lng,radius),totalPages=Math.max(1,Math.ceil(tiles.length/PAGE_SIZE));
 if(!Number.isInteger(page)||page<0||page>=totalPages)throw new RangeError('Invalid place page.');
 const selected=tiles.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE),places=new Map();
 await Promise.all(selected.map(async({z,x,y})=>{
  const response=await source.getZxy(z,x,y);if(!response)return;
  const layer=new VectorTile(new PbfReader(new Uint8Array(response.data))).layers.place;if(!layer)return;
  for(let i=0;i<layer.length;i++){
   const item=layer.feature(i);if(!categoryForOverture(item.properties))continue;
   const place=normalizePlace(item.toGeoJSON(x,y,z));
   if(place&&distance({lat,lng},place)<=radius+120)places.set(place.id,place);
  }
 }));
 return {places:[...places.values()],source:'Overture Maps',release:RELEASE,format:PLACE_FORMAT,dataDate:DATA_DATE,fetchedAt:new Date().toISOString(),page,totalPages,complete:totalPages===1};
}
