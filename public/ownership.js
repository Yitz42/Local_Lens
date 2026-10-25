import {ownershipCategories} from './ownership-categories.js?v=20261025-pharmacy1';
import {foodTypesFromTerms,matchesFoodTypes} from './food-types.js?v=20261025-pharmacy1';
export {ownershipCategories} from './ownership-categories.js?v=20261025-pharmacy1';
import {BRAND_DIRECTORY,DIRECTORY_META} from './brand-directory.js?v=20261025-pharmacy1';
export const CHECKED = DIRECTORY_META.checked;
export const LABELS = {independent:'Independent / co-op', corporate:'Corporate brand', pe:'Private equity backed', unknown:'Unknown ownership'};
export const CATEGORIES = [
 {id:'all',name:'All places',icon:'grid'}, {id:'restaurant',name:'Restaurants',icon:'food'},
 {id:'grocery',name:'Groceries',icon:'grocery'}, {id:'gas',name:'Gas stations',icon:'gas'},
 {id:'coffee',name:'Coffee & cafés',icon:'coffee'}, {id:'other',name:'More stores',icon:'shop'}
];
export function normalize(s=''){return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');}
const brandIndex=new Map(BRAND_DIRECTORY.flatMap(rule=>[rule.brand,...rule.aliases].map(alias=>[normalize(alias),rule])));
export function distance(a,b){const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r;const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function ownershipFor(p){
 // The curated directory currently covers US brands; do not infer international ownership.
 if(!(p.lat>24&&p.lat<50&&p.lng>-126&&p.lng<-66)) return {type:'unknown',parent:'Not yet verified',note:'Our selected US brand directory does not establish ownership of this place.'};
 // Accept a trailing numeric store identifier, while keeping the brand itself exact.
 // A location's explicit brand also matches when its display name includes a location.
 const candidates=[{value:p.brand,explicitBrand:true},{value:p.name,explicitBrand:false}].filter(item=>item.value).flatMap(item=>item.value.split(';').flatMap(value=>[value,value.replace(/\s*(?:\bstore\s*)?#\s*\d+\s*$/i,'')].map(value=>({key:normalize(value),value:value.trim().toLowerCase().normalize('NFKC'),explicitBrand:item.explicitBrand}))));
 for(const candidate of candidates){const rule=brandIndex.get(candidate.key);if(!rule)continue;if(rule.local&&distance(p,{lat:30.2747,lng:-97.7523})>25000)continue;if(rule.matchCategories&&!candidate.explicitBrand&&!rule.matchCategories.includes(p.category))continue;if(rule.preservePunctuation&&![rule.brand,...rule.aliases].some(alias=>alias.trim().toLowerCase().normalize('NFKC')===candidate.value))continue;return {...rule};}
 return {type:'unknown',parent:'Not yet verified',note:'This place has not been matched to our curated ownership directory. It may be independent, corporate, or private equity backed. Unknown does not mean independent.'};
}
export function categoryFor(t){if(t.amenity==='fuel')return 'gas';if(['cafe','ice_cream'].includes(t.amenity))return 'coffee';if(['restaurant','fast_food','food_court'].includes(t.amenity))return 'restaurant';if(['supermarket','convenience','greengrocer','bakery','deli'].includes(t.shop))return 'grocery';return 'other';}
export function fromOSM(elements){const out=[],seen=new Set();for(const e of elements){const t=e.tags||{},lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon;if(!t.name||!Number.isFinite(lat)||!Number.isFinite(lng))continue;const key=normalize(t.name)+':'+lat.toFixed(4)+':'+lng.toFixed(4);if(seen.has(key))continue;seen.add(key);const address=[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' ');out.push({id:e.type+'/'+e.id,name:t.name,brand:t.brand||'',lat,lng,category:categoryFor(t),address,addressCity:t['addr:city']||'',website:t.website||t['contact:website']||'',cuisine:(t.cuisine||'').replaceAll('_',' '),foodTypes:foodTypesFromTerms(t.cuisine||''),amenity:t.amenity||t.shop||'store'});}return out;}
export function filterPlaces(places,{category='all',hidden=[],foodTypes=[],origin,sort='distance',radius=Infinity}){return places.map(p=>({...p,ownership:ownershipFor(p),distance:distance(origin,p)})).filter(p=>(category==='all'||p.category===category)&&matchesFoodTypes(p,foodTypes)&&!hidden.some(type=>ownershipCategories(p.ownership).includes(type))&&p.distance<=radius).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='ownership'?(['independent','unknown','corporate','pe'].indexOf(a.ownership.type)-['independent','unknown','corporate','pe'].indexOf(b.ownership.type)||a.distance-b.distance):a.distance-b.distance);}
