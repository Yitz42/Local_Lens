import {ownershipCategories,allowsLocalOperator,hidesLocalOperator,allowsRegional,DEFAULT_LOCAL_LEVEL,LOCAL_HQ_RADIUS_MILES} from './ownership-categories.js?v=20261029-diet2';
import {storeTypeFromTerms} from './store-types.js?v=20261029-diet2';
import {foodTypesFromTerms,matchesFoodTypes} from './food-types.js?v=20261029-diet2';
export {ownershipCategories} from './ownership-categories.js?v=20261029-diet2';
import {BRAND_DIRECTORY,DIRECTORY_META} from './brand-directory.js?v=20261029-diet2';
import {excludedBrandNameMatch,hiddenNameMatch} from './name-filters.js?v=20261029-diet2';
import {inUSCoverage,matchesBrandScope,matchesBrandCategory} from './brand-scope.js?v=20261029-diet2';
export const CHECKED = DIRECTORY_META.checked;
export const LABELS = {independent:'Independent / co-op', corporate:'Corporate brand', pe:'Private equity backed', unknown:'Unknown ownership'};
export const CATEGORIES = [
 {id:'all',name:'All places',icon:'grid'},
 {id:'restaurant',name:'Restaurants',icon:'food',group:'Food & drink'}, {id:'bar',name:'Bars',icon:'bar',group:'Food & drink'},
 {id:'coffee',name:'Coffee & cafés',icon:'coffee',group:'Food & drink'}, {id:'grocery',name:'Groceries',icon:'grocery',group:'Food & drink'},
 {id:'pharmacy',name:'Pharmacies',icon:'pharmacy',group:'Stores'}, {id:'home',name:'Home & hardware',icon:'home',group:'Stores'},
 {id:'apparel',name:'Clothing & shoes',icon:'apparel',group:'Stores'}, {id:'general',name:'Department & discount',icon:'general',group:'Stores'},
 {id:'other',name:'More stores',icon:'shop',group:'Stores'},
 {id:'gas',name:'Gas stations',icon:'gas',group:'Services'}, {id:'auto',name:'Auto service',icon:'auto',group:'Services'},
 {id:'beauty',name:'Beauty & salons',icon:'beauty',group:'Services'}, {id:'fitness',name:'Fitness',icon:'fitness',group:'Services'},
 {id:'bank',name:'Banks & credit unions',icon:'bank',group:'Services'}
];
export function normalize(s=''){return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');}
const brandIndex=new Map();
for(const rule of BRAND_DIRECTORY)for(const alias of [rule.brand,...rule.aliases]){const key=normalize(alias);if(!brandIndex.has(key))brandIndex.set(key,[]);if(!brandIndex.get(key).includes(rule))brandIndex.get(key).push(rule);}
export function distance(a,b){const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r;const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function ownershipFor(p){
 // The curated directory currently covers US brands; do not infer international ownership.
 if(!inUSCoverage(p)) return {type:'unknown',parent:'Not yet verified',note:'Our selected US brand directory does not establish ownership of this place.'};
 // Accept a trailing numeric store identifier, while keeping the brand itself exact.
 // A location's explicit brand also matches when its display name includes a location.
 const candidates=[{value:p.brand,explicitBrand:true},{value:p.name,explicitBrand:false}].filter(item=>item.value).flatMap(item=>item.value.split(';').flatMap(value=>[value,value.replace(/\s*(?:\bstore\s*)?#\s*\d+\s*$/i,'')].map(value=>({key:normalize(value),value:value.trim().toLowerCase().normalize('NFKC'),explicitBrand:item.explicitBrand}))));
 for(const candidate of candidates)for(const rule of brandIndex.get(candidate.key)||[]){if(!matchesBrandScope(p,rule))continue;if(rule.local&&distance(p,{lat:30.2747,lng:-97.7523})>25000)continue;if(!candidate.explicitBrand&&!matchesBrandCategory(p,rule))continue;if(rule.preservePunctuation&&![rule.brand,...rule.aliases].some(alias=>alias.trim().toLowerCase().normalize('NFKC')===candidate.value))continue;return {...rule};}
 return {type:'unknown',parent:'Not yet verified',note:'This place has not been matched to our curated ownership directory. It may be independent, corporate, or private equity backed. Unknown does not mean independent.'};
}
export function categoryFor(t){if(t.amenity==='fuel')return 'gas';if(['bar','pub','biergarten','nightclub'].includes(t.amenity))return 'bar';if(t.amenity==='bank')return 'bank';if(['hairdresser','beauty','nails','massage','tattoo'].includes(t.shop))return 'beauty';if(['fitness_centre'].includes(t.leisure))return 'fitness';if(['car_repair','tyres'].includes(t.shop)||t.amenity==='car_wash')return 'auto';if(['cafe','ice_cream'].includes(t.amenity))return 'coffee';if(['restaurant','fast_food','food_court'].includes(t.amenity))return 'restaurant';if(['supermarket','convenience','greengrocer','bakery','deli','butcher','seafood','cheese','health_food'].includes(t.shop))return 'grocery';if(t.amenity==='pharmacy'||['chemist','pharmacy'].includes(t.shop))return 'pharmacy';if(['hardware','doityourself','furniture','garden_centre','houseware','paint','interior_decoration','kitchen','bathroom_furnishing','appliance','flooring','carpet','lighting','bed','trade'].includes(t.shop))return 'home';if(['clothes','shoes','boutique','fashion_accessories','jewelry','bag'].includes(t.shop))return 'apparel';if(['department_store','variety_store','discount','general','wholesale'].includes(t.shop))return 'general';return 'other';}
export function fromOSM(elements){const out=[],seen=new Set();for(const e of elements){const t=e.tags||{},lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon;if(!t.name||!Number.isFinite(lat)||!Number.isFinite(lng))continue;const key=normalize(t.name)+':'+lat.toFixed(4)+':'+lng.toFixed(4);if(seen.has(key))continue;seen.add(key);const address=[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' ');out.push({id:e.type+'/'+e.id,name:t.name,brand:t.brand||'',lat,lng,category:categoryFor(t),address,addressCity:t['addr:city']||'',website:t.website||t['contact:website']||'',...(categoryFor(t)==='other'?{storeType:storeTypeFromTerms([t.shop])}:{}),cuisine:(t.cuisine||'').replaceAll('_',' '),foodTypes:foodTypesFromTerms([t.cuisine||'',...['kosher','halal','vegetarian','vegan'].filter(diet=>['yes','only'].includes(t['diet:'+diet]))]),amenity:t.amenity||t.shop||'store'});}return out;}
// A privately held chain counts as a local corporation where its headquarters is within LOCAL_HQ_RADIUS_MILES.
export function headquartersDistanceMiles(place,brand){const hq=brand?.headquarters;if(!hq||brand.type!=='corporate'||brand.publicListing||!Number.isFinite(place?.lat)||!Number.isFinite(place?.lng))return null;return distance(place,hq)/1609.344;}
export function isLocalCorporation(place,brand){const miles=headquartersDistanceMiles(place,brand);return miles!==null&&miles<=LOCAL_HQ_RADIUS_MILES;}
// localLevel lets locally run franchise/dealer locations of a hidden brand through (see LOCAL_LEVELS).
function ownershipHidden(p,hidden,matchBrandNames,localLevel){
 if((hidden.includes('corporate')||hidden.includes('pe'))&&hidesLocalOperator(localLevel,p.ownership))return true;
 if(allowsLocalOperator(localLevel,p.ownership)||allowsRegional(localLevel)&&isLocalCorporation(p,p.ownership))return false;
 if(hidden.some(type=>ownershipCategories(p.ownership).includes(type)))return true;
 if(!matchBrandNames)return false;
 const match=excludedBrandNameMatch(p,hidden);return !!match&&!allowsLocalOperator(localLevel,match)&&!(allowsRegional(localLevel)&&isLocalCorporation(p,match));
}
export function filterPlaces(places,{category='all',storeType='all',hidden=[],foodTypes=[],hiddenNames=[],matchBrandNames=false,localLevel=DEFAULT_LOCAL_LEVEL,origin,sort='distance',radius=Infinity}){return places.map(p=>({...p,ownership:ownershipFor(p),distance:distance(origin,p)})).filter(p=>(category==='all'||p.category===category)&&(category!=='other'||storeType==='all'||(p.storeType||'other')===storeType)&&matchesFoodTypes(p,foodTypes)&&!hiddenNameMatch(p,hiddenNames)&&!ownershipHidden(p,hidden,matchBrandNames,localLevel)&&p.distance<=radius).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='ownership'?(['independent','unknown','corporate','pe'].indexOf(a.ownership.type)-['independent','unknown','corporate','pe'].indexOf(b.ownership.type)||a.distance-b.distance):a.distance-b.distance);}
