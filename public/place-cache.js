import {distance} from './ownership.js';
const MAX_AGE=7*86400000;
export function areaKey(origin,radius){return `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)},${radius}`;}
export function findNearbyCache(records,origin,radius,now=Date.now()){
 if(!Array.isArray(records))return null;
 return records.filter(r=>r&&Number.isFinite(r.origin?.lat)&&Number.isFinite(r.origin?.lng)&&Number.isFinite(r.radius)&&Array.isArray(r.places)&&Number.isFinite(r.savedAt)&&now-r.savedAt>=0&&now-r.savedAt<MAX_AGE&&distance(r.origin,origin)+radius<=r.radius+1).sort((a,b)=>b.savedAt-a.savedAt)[0]||null;
}
export function storeNearbyCache(records,record,now=Date.now()){
 const safe=Array.isArray(records)?records:[];
 return [record,...safe.filter(r=>r&&r.key!==record.key&&Number.isFinite(r.savedAt)&&now-r.savedAt<MAX_AGE)].slice(0,4);
}
