import {ownershipCategories,allowsLocalOperator,hidesLocalOperator,allowsRegional,DEFAULT_LOCAL_LEVEL,LOCAL_HQ_RADIUS_MILES} from './ownership-categories.js?v=20261030-hospitals1';
import {storeTypeFromTerms} from './store-types.js?v=20261030-hospitals1';
import {foodTypesFromTerms,matchesFoodTypes} from './food-types.js?v=20261030-hospitals1';
export {ownershipCategories} from './ownership-categories.js?v=20261030-hospitals1';
import {BRAND_DIRECTORY,DIRECTORY_META} from './brand-directory.js?v=20261030-hospitals1';
import {excludedBrandNameMatch,hiddenNameMatch} from './name-filters.js?v=20261030-hospitals1';
import {inUSCoverage,matchesBrandScope,matchesBrandCategory} from './brand-scope.js?v=20261030-hospitals1';
import {findHospital} from './hospital-match.js?v=20261030-hospitals1';
import {HOSPITALS,HOSPITAL_TRACKER,PARENTS,FIRMS,REAL_ESTATE} from './hospital-ownership.js?v=20261030-hospitals1';
export const CHECKED = DIRECTORY_META.checked;
export const LABELS = {independent:'Independent / co-op', corporate:'Corporate brand', pe:'Private equity backed', unknown:'Unknown ownership'};
export const CATEGORIES = [
 {id:'all',name:'All places',icon:'grid'},
 {id:'restaurant',name:'Restaurants',icon:'food',group:'Food & drink'}, {id:'bar',name:'Bars',icon:'bar',group:'Food & drink'},
 {id:'coffee',name:'Coffee & cafés',icon:'coffee',group:'Food & drink'}, {id:'grocery',name:'Groceries',icon:'grocery',group:'Food & drink'},
 {id:'home',name:'Home & hardware',icon:'home',group:'Stores'},
 {id:'apparel',name:'Clothing & shoes',icon:'apparel',group:'Stores'}, {id:'general',name:'Department & discount',icon:'general',group:'Stores'},
 {id:'other',name:'More stores',icon:'shop',group:'Stores'},
 {id:'gas',name:'Gas stations',icon:'gas',group:'Services'}, {id:'cars',name:'Car dealers',icon:'cars',group:'Services'}, {id:'phone',name:'Phone & internet stores',icon:'phone',group:'Services'}, {id:'auto',name:'Auto service',icon:'auto',group:'Services'},
 {id:'carwash',name:'Car washes',icon:'carwash',group:'Services'}, {id:'beauty',name:'Beauty & salons',icon:'beauty',group:'Services'}, {id:'fitness',name:'Fitness',icon:'fitness',group:'Services'},
 {id:'bank',name:'Banks & credit unions',icon:'bank',group:'Services'},
 {id:'print',name:'Print & design',icon:'print',group:'Services'}, {id:'laundry',name:'Laundry & dry cleaning',icon:'laundry',group:'Services'},
 {id:'childcare',name:'Child care & tutoring',icon:'childcare',group:'Services'}, {id:'pets',name:'Pet care & vets',icon:'pet',group:'Services'}, {id:'repair',name:'Repair & alterations',icon:'repair',group:'Services'},
 {id:'storage',name:'Storage & rentals',icon:'storage',group:'Services'}, {id:'money',name:'Tax & money services',icon:'money',group:'Services'},
 {id:'realestate',name:'Real estate & insurance',icon:'realestate',group:'Services'}, {id:'funeral',name:'Funeral homes',icon:'funeral',group:'Services'},
 {id:'hospital',name:'Hospitals',icon:'hospital',group:'Health'}, {id:'pharmacy',name:'Pharmacies',icon:'pharmacy',group:'Health'}, {id:'clinic',name:'Doctors & urgent care',icon:'clinic',group:'Health'},
 {id:'dental',name:'Dentists',icon:'dental',group:'Health'}, {id:'lab',name:'Labs & imaging',icon:'lab',group:'Health'}, {id:'hearing',name:'Hearing care',icon:'hearing',group:'Health'}, {id:'therapy',name:'Physical therapy & chiropractic',icon:'therapy',group:'Health'}, {id:'senior',name:'Senior living & home care',icon:'senior',group:'Health'}, {id:'eye',name:'Eye care & glasses',icon:'eye',group:'Health'},
 {id:'hotel',name:'Hotels',icon:'hotel',group:'Travel & fun'}, {id:'fun',name:'Movies & fun',icon:'fun',group:'Travel & fun'}
];
export function normalize(s=''){return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');}
const brandIndex=new Map();
for(const rule of BRAND_DIRECTORY)for(const alias of [rule.brand,...rule.aliases]){const key=normalize(alias);if(!brandIndex.has(key))brandIndex.set(key,[]);if(!brandIndex.get(key).includes(rule))brandIndex.get(key).push(rule);}
// Hotel names usually lead with the brand ("Hampton Inn Baltimore"), so records that opt in (matchNamePrefix)
// also match a leading brand name, but only within their guarded categories.
function nameWords(value=''){return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’'`]/g,'').split(/[^a-z0-9]+/).filter(Boolean);}
const nameRules=BRAND_DIRECTORY.filter(rule=>rule.matchNamePrefix||rule.matchNameAnywhere).flatMap(rule=>[rule.brand,...rule.aliases].map(alias=>({rule,words:nameWords(alias)}))).filter(item=>item.words.length).sort((a,b)=>b.words.length-a.words.length);
// Agent listings put the brand after the person's name ("Bryant Jenkins - State Farm Insurance Agent"), so
// records can opt into matching their name as a whole-word sequence anywhere, again only in their categories.
function nameMatches(words,brandWords,anywhere){for(let start=0;start<=(anywhere?words.length-brandWords.length:0);start++)if(brandWords.every((word,i)=>words[start+i]===word))return true;return false;}
export function distance(a,b){const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r;const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
// Hospitals are matched facility by facility against the PE Hospital Tracker, not by brand.
export function hospitalOwnership(p){
 const row=findHospital(p,HOSPITALS);if(!row)return null;
 const [, , state,ccn,pe,parentIndex,firmIndex,realEstateIndex,jv]=row,parent=PARENTS[parentIndex]||'',firms=FIRMS[firmIndex]||'',realEstate=REAL_ESTATE[realEstateIndex]||'';
 const extra=[jv?'The tracker marks this hospital as a joint venture or partnership.':'',realEstate?`The tracker lists ${realEstate} as owning the real estate.`:''].filter(Boolean).join(' ');
 return {brand:parent||'Hospital',type:pe?'pe':'corporate',parent:pe?[parent,firms].filter(Boolean).join(' · '):parent,
  note:(pe?`The ${HOSPITAL_TRACKER.title} lists this hospital (CMS certification ${ccn}, ${state}) as currently private equity backed${parent?' through '+parent:''}${firms?', with '+firms:''}.`:`The ${HOSPITAL_TRACKER.title} lists this hospital (CMS certification ${ccn}, ${state}) as for-profit and part of ${parent}. It is not listed as private equity backed.`)+(extra?' '+extra:''),
  source:HOSPITAL_TRACKER.url,sourceTitle:HOSPITAL_TRACKER.title,checked:HOSPITAL_TRACKER.checked,matchLevel:'facility',aliases:[]};
}
// Map listings often add what the place is after the brand ("Olive Garden Italian Restaurant", "Kroger Pharmacy",
// "Pep Boys Auto Service & Tires"). Dropping one such trailing descriptor still requires an exact brand name.
const DESCRIPTOR=/^(.+?)\s+(?:[-–|:]\s*)?(?:(?:italian|mexican|chinese|japanese|thai|seafood|steak|family)\s+restaurant|restaurant|gas station|specialty pharmacy|pharmacy|self storage|rent a car|car rental|truck rental|auto service(?:\s*(?:&|and)\s*tires)?|auto care|supermarket|stores|store|express|bakery cafe|urgent care|massage and facial spa|spa|atm)$/i;
function withoutDescriptor(value){const match=value.trim().match(DESCRIPTOR);return match?match[1]:'';}
export function ownershipFor(p){
 // The curated directory currently covers US brands; do not infer international ownership.
 if(!inUSCoverage(p)) return {type:'unknown',parent:'Not yet verified',note:'Our selected US brand directory does not establish ownership of this place.'};
 if(p.category==='hospital'){const hospital=hospitalOwnership(p);if(hospital)return hospital;}
 // Accept a trailing numeric store identifier, while keeping the brand itself exact.
 // A location's explicit brand also matches when its display name includes a location.
 const candidates=[{value:p.brand,explicitBrand:true},{value:p.name,explicitBrand:false}].filter(item=>item.value).flatMap(item=>item.value.split(';').flatMap(value=>[value,value.replace(/\s*(?:\bstore\s*)?#\s*\d+\s*$/i,''),withoutDescriptor(value)].filter(Boolean).map(value=>({key:normalize(value),value:value.trim().toLowerCase().normalize('NFKC'),explicitBrand:item.explicitBrand}))));
 for(const candidate of candidates)for(const rule of brandIndex.get(candidate.key)||[]){if(!matchesBrandScope(p,rule))continue;if(rule.local&&distance(p,{lat:30.2747,lng:-97.7523})>25000)continue;if(!candidate.explicitBrand&&!matchesBrandCategory(p,rule))continue;if(rule.preservePunctuation&&![rule.brand,...rule.aliases].some(alias=>alias.trim().toLowerCase().normalize('NFKC')===candidate.value))continue;return {...rule};}
 const words=nameWords(p.name);
 for(const {rule,words:brandWords} of nameRules)if(nameMatches(words,brandWords,rule.matchNameAnywhere)&&matchesBrandScope(p,rule)&&matchesBrandCategory(p,rule))return {...rule};
 return {type:'unknown',parent:'Not yet verified',note:'This place has not been matched to our curated ownership directory. It may be independent, corporate, or private equity backed. Unknown does not mean independent.'};
}
export function categoryFor(t){if(t.amenity==='fuel')return 'gas';if(['bar','pub','biergarten','nightclub'].includes(t.amenity))return 'bar';if(t.amenity==='bank')return 'bank';if(['hotel','motel','guest_house','hostel'].includes(t.tourism))return 'hotel';if(t.amenity==='cinema'||['bowling_alley','amusement_arcade','trampoline_park','miniature_golf','escape_game'].includes(t.leisure)||t.tourism==='theme_park')return 'fun';if(['childcare','kindergarten'].includes(t.amenity)||t.office==='tutoring')return 'childcare';if(t.shop==='storage_rental'||['car_rental','truck_rental'].includes(t.amenity))return 'storage';if(['money_transfer','bureau_de_change'].includes(t.amenity)||t.office==='tax_advisor'||t.shop==='money_lender')return 'money';if(['estate_agent','insurance'].includes(t.office))return 'realestate';if(['car','motorcycle','truck'].includes(t.shop))return 'cars';if(['mobile_phone','telecommunication'].includes(t.shop))return 'phone';if(['physiotherapist','occupational_therapist','speech_therapist','chiropractor'].includes(t.healthcare)||t['healthcare:speciality']==='chiropractic')return 'therapy';if(t.shop==='funeral_directors'||['funeral_hall','crematorium'].includes(t.amenity))return 'funeral';if(['assisted_living','nursing_home'].includes(t.social_facility)||t['social_facility:for']==='senior'||t.amenity==='nursing_home')return 'senior';if(t.amenity==='dentist'||t.healthcare==='dentist')return 'dental';if(t.amenity==='hospital'||t.healthcare==='hospital')return 'hospital';if(['clinic','doctors'].includes(t.amenity)||['clinic','doctor'].includes(t.healthcare))return 'clinic';if(t.shop==='optician'||t.healthcare==='optometrist')return 'eye';if(t.shop==='copyshop'||['printer','signmaker','sign_maker'].includes(t.craft)||t.office==='graphic_design')return 'print';if(['laundry','dry_cleaning'].includes(t.shop))return 'laundry';if(t.amenity==='veterinary'||t.shop==='pet_grooming'||t.amenity==='animal_boarding')return 'pets';if(['electronics_repair','shoemaker','tailor','watchmaker'].includes(t.craft)||['repair','tailor','shoe_repair','computer_repair','mobile_phone_repair'].includes(t.shop))return 'repair';if(['hairdresser','beauty','nails','massage','tattoo'].includes(t.shop))return 'beauty';if(['fitness_centre'].includes(t.leisure))return 'fitness';if(t.amenity==='car_wash')return 'carwash';if(['car_repair','tyres'].includes(t.shop))return 'auto';if(t.healthcare==='laboratory'||t.healthcare==='blood_donation'||t.healthcare==='sample_collection')return 'lab';if(t.shop==='hearing_aids'||t.healthcare==='audiologist')return 'hearing';if(['cafe','ice_cream'].includes(t.amenity))return 'coffee';if(['restaurant','fast_food','food_court'].includes(t.amenity))return 'restaurant';if(['supermarket','convenience','greengrocer','bakery','deli','butcher','seafood','cheese','health_food'].includes(t.shop))return 'grocery';if(t.amenity==='pharmacy'||['chemist','pharmacy'].includes(t.shop))return 'pharmacy';if(['hardware','doityourself','furniture','garden_centre','houseware','paint','interior_decoration','kitchen','bathroom_furnishing','appliance','flooring','carpet','lighting','bed','trade'].includes(t.shop))return 'home';if(['clothes','shoes','boutique','fashion_accessories','jewelry','bag'].includes(t.shop))return 'apparel';if(['department_store','variety_store','discount','general','wholesale'].includes(t.shop))return 'general';return 'other';}
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
