import {PMTiles,FetchSource} from 'pmtiles';
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {foodTypesFromTerms,foodTypeLabel} from '../public/food-types.js';
import {storeTypeFromTerms} from '../public/store-types.js';
export const RELEASE='2026-10-21.0';
export const DATA_DATE='2026-10-21T00:00:00Z';
export const ARCHIVE_URL=`https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/${RELEASE}/places.pmtiles`;
export const PAGE_SIZE=4;
export const PLACE_FORMAT='print-design-v2';
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
 if(terms.some(t=>/^(fashion_and_apparel_store|clothing_store|shoe_store)$/.test(t)))return 'apparel';
 if(terms.some(t=>/^(department_store|discount_store|warehouse_club_store)$/.test(t)))return 'general';
 if(terms.some(t=>t==='shopping'||t==='retail'))return 'other';
 if(terms.some(t=>/^(beauty_salon|hair_salon|nail_salon|barber|skin_care_and_makeup|hair_removal|waxing|tanning_salon|spa|day_spa|medical_spa|massage_therapy|tattoo_and_piercing|eyelash_service)$/.test(t)))return 'beauty';
 if(terms.some(t=>/^(gym|fitness_studio|yoga_studio|pilates_studio|boxing_gym|boxing_class|boot_camp|fitness_trainer|dance_studio|martial_arts_club|climbing_gym|cycling_studio)$/.test(t)))return 'fitness';
 if(terms.some(t=>/^(automotive_service|automotive_repair|auto_body_shop|tire_dealer_and_repair|tire_shop|auto_detailing|car_wash|auto_glass_service|oil_change_station)$/.test(t)))return 'auto';
 if(terms.some(t=>/^(bank_or_credit_union|bank|credit_union)$/.test(t)))return 'bank';
 // Print shops, graphic designers, and sign makers. Shipping centers are left out because the label also covers
 // post offices, parcel lockers, and drop boxes.
 if(terms.some(t=>/^(printing_service|screen_printing_service|t_shirt_printing_service|commercial_printer|print_media|copy_shop|graphic_designer|sign_making|signmaking|sign_maker)$/.test(t)))return 'print';
 if(terms.some(t=>/^(laundry_service|laundromat|dry_cleaning|laundry)$/.test(t)))return 'laundry';
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
