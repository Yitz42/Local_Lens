import {foodTypesFromTerms,foodTypeLabel} from './food-types.js?v=20261025-pharmacy1';

export const GOOGLE_KEY_STORAGE='local-lens-google-browser-key-v1';
export const GOOGLE_SAVED_STORAGE='local-lens-google-saved-ids-v1';
export const GOOGLE_FIELDS=['id','displayName','location','formattedAddress','businessStatus','types','primaryType','googleMapsURI','attributions'];
export const GOOGLE_TYPES={
 restaurant:['restaurant'],grocery:['supermarket','grocery_store','convenience_store','bakery','deli'],
 gas:['gas_station'],coffee:['cafe','coffee_shop','tea_house','ice_cream_shop'],
 other:['pharmacy','drugstore','department_store','clothing_store','hardware_store','electronics_store','book_store','pet_store','florist','home_goods_store','shoe_store','auto_parts_store']
};
const CUISINES={italian:'italian_restaurant',pizza:'pizza_restaurant',mexican:'mexican_restaurant',chinese:'chinese_restaurant',japanese:'japanese_restaurant',sushi:'sushi_restaurant',indian:'indian_restaurant',thai:'thai_restaurant',american:'american_restaurant',burgers:'hamburger_restaurant',barbecue:'barbecue_restaurant',seafood:'seafood_restaurant',mediterranean:'mediterranean_restaurant',greek:'greek_restaurant',french:'french_restaurant',sandwiches:'sandwich_shop'};
export function googleSearchGroups(category='all',foodTypes=[]){
 const cuisineTypes=[...new Set(foodTypes.map(id=>CUISINES[id]).filter(Boolean))];
 return cuisineTypes.length?[cuisineTypes]:category==='all'?Object.values(GOOGLE_TYPES):[GOOGLE_TYPES[category]||GOOGLE_TYPES.other];
}
export function googleCategory(types=[],primary=''){
 const list=[primary,...types];
 for(const category of ['gas','grocery','coffee','restaurant','other'])if(list.some(type=>GOOGLE_TYPES[category].includes(type)))return category;
 if(list.some(type=>type?.endsWith('_restaurant')||type==='sandwich_shop'))return 'restaurant';
 return 'other';
}
export function normalizeGooglePlace(place){
 const location=place.location,lat=typeof location?.lat==='function'?location.lat():location?.lat,lng=typeof location?.lng==='function'?location.lng():location?.lng;
 // Operational is a business status, not a claim that it is open at this hour.
 if(!place.id||!place.displayName||!Number.isFinite(lat)||!Number.isFinite(lng)||['CLOSED_PERMANENTLY','CLOSED_TEMPORARILY','FUTURE_OPENING'].includes(place.businessStatus))return null;
 const types=Array.isArray(place.types)?place.types:[],foodTypes=foodTypesFromTerms([place.primaryType,...types]);
 return {id:'google/'+place.id,googlePlaceId:place.id,name:place.displayName,lat,lng,category:googleCategory(types,place.primaryType),address:place.formattedAddress||'',addressCity:'',foodTypes,cuisine:foodTypeLabel({foodTypes}),source:'Google Maps',googleMapsURI:place.googleMapsURI||'',attributions:(place.attributions||[]).filter(a=>typeof a.provider==='string').map(a=>({provider:a.provider,providerURI:a.providerURI||''})),businessStatus:place.businessStatus||null};
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
export async function searchGooglePlaces(Place,origin,radius,category='all',foodTypes=[],onProgress=()=>{}){
 const groups=googleSearchGroups(category,foodTypes),unique=new Map();let done=0;
 // A small fixed set of requests, never a grid crawl. Nearby Search caps each request at 20 results.
 for(const types of groups){
  const response=await Place.searchNearby({fields:GOOGLE_FIELDS,locationRestriction:{center:origin,radius},includedTypes:types,maxResultCount:20,rankPreference:'DISTANCE'});
  for(const raw of response.places||[]){const place=normalizeGooglePlace(raw);if(place)unique.set(place.id,place);}
  onProgress(++done,groups.length);
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
