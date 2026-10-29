import {foodTypesFromTerms,foodTypeLabel} from './food-types.js?v=20261029-kosher1';
import {storeTypeFromTerms} from './store-types.js?v=20261029-kosher1';

export const GOOGLE_KEY_STORAGE='local-lens-google-browser-key-v1';
export const GOOGLE_SAVED_STORAGE='local-lens-google-saved-ids-v1';
export const GOOGLE_FIELDS=['id','displayName','location','formattedAddress','businessStatus','types','primaryType','googleMapsURI','attributions'];
export const GOOGLE_TYPES={
 restaurant:['restaurant'],grocery:['supermarket','grocery_store','convenience_store','bakery','deli'],
 gas:['gas_station'],coffee:['cafe','coffee_shop','tea_house','ice_cream_shop'],
 pharmacy:['pharmacy','drugstore'],home:['hardware_store','home_improvement_store','home_goods_store','furniture_store'],
 apparel:['clothing_store','shoe_store','jewelry_store'],general:['department_store','discount_store','warehouse_store'],
 other:['electronics_store','book_store','pet_store','florist','auto_parts_store','sporting_goods_store','gift_shop'],
 bar:['bar','night_club'],beauty:['beauty_salon','hair_care','spa'],fitness:['gym'],auto:['car_repair','car_wash'],bank:['bank']
};
// An all-places search keeps one request for every store category so it stays within five requests.
const STORE_TYPES=['pharmacy','home','apparel','general','other'].flatMap(category=>GOOGLE_TYPES[category]);
const CUISINES={italian:'italian_restaurant',pizza:'pizza_restaurant',mexican:'mexican_restaurant',chinese:'chinese_restaurant',japanese:'japanese_restaurant',sushi:'sushi_restaurant',indian:'indian_restaurant',thai:'thai_restaurant',american:'american_restaurant',burgers:'hamburger_restaurant',barbecue:'barbecue_restaurant',seafood:'seafood_restaurant',mediterranean:'mediterranean_restaurant',greek:'greek_restaurant',french:'french_restaurant',sandwiches:'sandwich_shop',kosher:null,halal:null,vegetarian:['vegetarian_restaurant','vegan_restaurant'],vegan:'vegan_restaurant'};
export function googleSearchGroups(category='all',foodTypes=[]){
 const cuisineTypes=['all','restaurant'].includes(category)?[...new Set(foodTypes.flatMap(id=>CUISINES[id]??[]))]:[];
 return cuisineTypes.length?[cuisineTypes]:category==='all'?[GOOGLE_TYPES.restaurant,GOOGLE_TYPES.grocery,GOOGLE_TYPES.gas,GOOGLE_TYPES.coffee,STORE_TYPES]:[GOOGLE_TYPES[category]||GOOGLE_TYPES.other];
}
const CATEGORY_ORDER=['gas','grocery','coffee','restaurant','bar','pharmacy','home','apparel','general','other','beauty','fitness','auto','bank'];
// Google lists many eateries as bakeries or delis too; those types only mean a shop when there is no restaurant type.
const SHOP_FOOD_TYPES=['bakery','deli'];
const isRestaurantType=type=>type==='restaurant'||type==='sandwich_shop'||type==='bagel_shop'||!!type?.endsWith('_restaurant');
function categoryOfType(type){return CATEGORY_ORDER.find(category=>GOOGLE_TYPES[category].includes(type))||(isRestaurantType(type)?'restaurant':null);}
export function googleCategory(types=[],primary=''){
 const list=[primary,...types].filter(Boolean),eatery=list.some(isRestaurantType);
 const main=categoryOfType(primary);
 if(main&&!(SHOP_FOOD_TYPES.includes(primary)&&eatery))return main;
 for(const category of CATEGORY_ORDER){
  const matches=list.filter(type=>GOOGLE_TYPES[category].includes(type));
  if(matches.length&&!(category==='grocery'&&eatery&&matches.every(type=>SHOP_FOOD_TYPES.includes(type))))return category;
 }
 return eatery?'restaurant':'other';
}
export function normalizeGooglePlace(place){
 const location=place.location,lat=typeof location?.lat==='function'?location.lat():location?.lat,lng=typeof location?.lng==='function'?location.lng():location?.lng;
 // Operational is a business status, not a claim that it is open at this hour.
 if(!place.id||!place.displayName||!Number.isFinite(lat)||!Number.isFinite(lng)||['CLOSED_PERMANENTLY','CLOSED_TEMPORARILY','FUTURE_OPENING'].includes(place.businessStatus))return null;
 const types=Array.isArray(place.types)?place.types:[],foodTypes=foodTypesFromTerms([place.primaryType,...types]);
 return {id:'google/'+place.id,googlePlaceId:place.id,name:place.displayName,lat,lng,category:googleCategory(types,place.primaryType),...(googleCategory(types,place.primaryType)==='other'?{storeType:storeTypeFromTerms([place.primaryType,...types])}:{}),address:place.formattedAddress||'',addressCity:'',foodTypes,cuisine:foodTypeLabel({foodTypes}),source:'Google Maps',googleMapsURI:place.googleMapsURI||'',attributions:(place.attributions||[]).filter(a=>typeof a.provider==='string').map(a=>({provider:a.provider,providerURI:a.providerURI||''})),businessStatus:place.businessStatus||null};
}
export function savedGoogleIds(value){return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,255}$/.test(id)))]:[];}
export function googleKey(storage){try{return (storage??globalThis.localStorage)?.getItem(GOOGLE_KEY_STORAGE)?.trim()||'';}catch{return '';}}
let loading;
export function loadGoogleMaps(key){
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');let timer;
  const fail=()=>{clearTimeout(timer);delete window.__localLensGoogleReady;loading=null;reject(new Error('Google Maps could not connect. Check the key, API access, billing, and website restrictions.'));};
  window.gm_authFailure=fail;
  window.__localLensGoogleReady=()=>{clearTimeout(timer);delete window.__localLensGoogleReady;resolve(window.google.maps);};
  script.src='https://maps.googleapis.com/maps/api/js?'+new URLSearchParams({key,v:'weekly',loading:'async',callback:'__localLensGoogleReady'});
  script.async=true;script.onerror=fail;timer=setTimeout(fail,20000);document.head.append(script);
 });
 return loading;
}
const TEXT_SEARCH_DIETS=['kosher','halal'];
const TEXT_SEARCH_SUFFIX={restaurant:' restaurant',grocery:' grocery store',coffee:' bakery cafe',bar:' bar'};
function metersBetween(a,b){const r=Math.PI/180,h=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;return 12742000*Math.asin(Math.sqrt(h));}
export async function searchGooglePlaces(Place,origin,radius,category='all',foodTypes=[],onProgress=()=>{}){
 const groups=googleSearchGroups(category,foodTypes),textSearches=foodTypes.filter(id=>TEXT_SEARCH_DIETS.includes(id)),unique=new Map();let done=0;
 // A small fixed set of requests, never a grid crawl. Nearby Search caps each request at 20 results.
 for(const types of groups){
  const response=await Place.searchNearby({fields:GOOGLE_FIELDS,locationRestriction:{center:origin,radius},includedTypes:types,maxResultCount:20,rankPreference:'DISTANCE'});
  for(const raw of response.places||[]){const place=normalizeGooglePlace(raw);if(place)unique.set(place.id,place);}
  onProgress(++done,groups.length+textSearches.length);
 }
 // Google has no kosher or halal place type, so a text search finds places it associates with that food.
 for(const diet of textSearches){
  const response=await Place.searchByText({fields:GOOGLE_FIELDS,textQuery:diet+(TEXT_SEARCH_SUFFIX[category]||''),locationBias:{center:origin,radius},maxResultCount:20});
  for(const raw of response.places||[]){const place=normalizeGooglePlace(raw);if(!place||metersBetween(origin,place)>radius)continue;const existing=unique.get(place.id)||place;unique.set(place.id,{...existing,foodTypes:[...new Set([...existing.foodTypes,diet])]});}
  onProgress(++done,groups.length+textSearches.length);
 }
 return {places:[...unique.values()],fetchedAt:new Date().toISOString(),source:'Google Maps',limited:true};
}
export async function resolveGoogleSaved(Place,ids){
 const places=[],unavailable=[];
 for(const id of savedGoogleIds(ids))try{const instance=new Place({id});const result=await instance.fetchFields({fields:GOOGLE_FIELDS});const place=normalizeGooglePlace(result.place||instance);if(place)places.push(place);else unavailable.push(id);}catch{unavailable.push(id);}
 return {places,unavailable};
}
export async function createGoogleMap(key,element,origin,onMove,onSelect){
 const maps=await loadGoogleMaps(key),[{Map,Circle},{Place}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('places')]);
 const native=new Map(element,{center:origin,zoom:14,minZoom:3,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,clickableIcons:false});
 let circles=[],center;
 native.addListener('dragend',onMove);native.addListener('zoom_changed',onMove);
 const map={
  setView:([lat,lng],zoom)=>{native.setCenter({lat,lng});native.setZoom(zoom);},
  getCenter:()=>({lat:native.getCenter().lat(),lng:native.getCenter().lng()}),
  fitBounds:points=>{const bounds=new maps.LatLngBounds();points.forEach(([lat,lng])=>bounds.extend({lat,lng}));native.fitBounds(bounds,60);},
  invalidateSize:()=>maps.event.trigger(native,'resize')
 };
 const colors={independent:'#245641',corporate:'#a76b31',pe:'#8a6286',unknown:'#77837a'};
 return {map,Place,
  drawCenter(position){center?.setMap(null);center=new Circle({map:native,center:position,radius:22,fillColor:'#245641',fillOpacity:1,strokeColor:'#ffffff',strokeWeight:3,clickable:false,zIndex:100});},
  renderMarkers(places){circles.forEach(circle=>circle.setMap(null));circles=places.map(place=>{const circle=new Circle({map:native,center:{lat:place.lat,lng:place.lng},radius:38,fillColor:colors[place.ownership.type],fillOpacity:1,strokeColor:'#ffffff',strokeWeight:2});circle.addListener('click',()=>onSelect(place.id));return circle;});}
 };
}
