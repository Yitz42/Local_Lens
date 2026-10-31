// Entry point for the iOS app's JavaScriptCore bundle, built by scripts/build-ios-core.mjs.
// The app reuses the website's place lookup, categories, and ownership matching instead of a Swift copy,
// so a data or rule change here reaches both after a rebuild. Swift supplies byte-range reads of the
// Overture archive through __nativeGetBytes(url, offset, length, resolve, reject).
import {PMTiles} from 'pmtiles';
import {lookupPlacesPage,ARCHIVE_URL,RELEASE,DATA_DATE} from '../worker/overture.js';
import {collectPlacePages} from '../public/places-loader.js';
import {filterPlaces,CATEGORIES,LABELS,CHECKED,isLocalCorporation} from '../public/ownership.js';
import {LOCAL_LEVELS,DEFAULT_LOCAL_LEVEL,localOperatorLabel,localOperatorNote} from '../public/ownership-categories.js';
import {DEFAULT_OWNERSHIP_FILTERS} from '../public/food-types.js';
import {STORE_TYPES,storeTypeName} from '../public/store-types.js';
import {BRAND_DIRECTORY,DIRECTORY_META} from '../public/brand-directory.js';
import {searchBrands,TYPE_LABELS} from '../public/directory-utils.js';

const nativeSource={
 getKey:()=>ARCHIVE_URL,
 getBytes:(offset,length)=>new Promise((resolve,reject)=>globalThis.__nativeGetBytes(ARCHIVE_URL,offset,length,data=>resolve({data}),message=>reject(new Error(message))))
};
const archive=new PMTiles(nativeSource);
let places=[],loadId=0;

function listing(brand){
 const exchanges=brand.publicListing?.exchanges||[];
 return exchanges.map(item=>`${item.exchange}: ${item.ticker}`).join(', ');
}
function ownershipView(place,o){
 return {type:o.type,label:LABELS[o.type]||o.type,brand:o.brand||'',parent:o.parent||'',note:o.note||'',source:o.source||'',sourceTitle:o.sourceTitle||'',checked:o.checked||'',
  localLabel:localOperatorLabel(o),localNote:localOperatorNote(o),localCorporation:isLocalCorporation(place,o),listing:listing(o),listingCompany:o.publicListing?.company||'',matchLevel:o.matchLevel||'brand'};
}
function placeView(p){
 const category=CATEGORIES.find(c=>c.id===p.category);
 return {id:p.id,name:p.name,brand:p.brand||'',lat:p.lat,lng:p.lng,category:p.category,categoryName:category?.name||p.category,
  storeType:p.category==='other'?storeTypeName(p.storeType||'other'):'',address:p.address||'',addressCity:p.addressCity||'',website:p.website||'',
  cuisine:p.cuisine||'',source:p.source||'',release:p.release||'',distance:p.distance,ownership:ownershipView(p,p.ownership)};
}
function brandView(b){
 return {brand:b.brand,type:b.type,label:TYPE_LABELS[b.type]||b.type,parent:b.parent||'',note:b.note||'',source:b.source||'',sourceTitle:b.sourceTitle||'',checked:b.checked||'',
  aliases:b.aliases||[],localLabel:localOperatorLabel(b),listing:listing(b)};
}

globalThis.LocalLensCore={
 info(){
  return JSON.stringify({release:RELEASE,dataDate:DATA_DATE,checked:CHECKED,directory:DIRECTORY_META,
   categories:CATEGORIES.map(({id,name,group})=>({id,name,group:group||''})),storeTypes:STORE_TYPES.map(({id,name})=>({id,name})),
   localLevels:LOCAL_LEVELS.map(({label,detail})=>({label,detail})),defaultLocalLevel:DEFAULT_LOCAL_LEVEL,defaultHidden:DEFAULT_OWNERSHIP_FILTERS});
 },
 // Loads every page for the area, eight at a time like the GitHub Pages build, and keeps the places here.
 // A newer load replaces an older one that is still running.
 load(lat,lng,radius,onProgress,onDone,onError){
  const id=++loadId;
  collectPlacePages(page=>{if(id!==loadId)throw new Error('Search replaced');return lookupPlacesPage(lat,lng,radius,page,archive);},(done,total)=>onProgress(done,total),8)
   .then(result=>{if(id!==loadId)throw new Error('Search replaced');places=result.places;onDone(JSON.stringify({count:places.length,release:result.release,dataDate:result.dataDate}));})
   .catch(error=>onError(error?.message||String(error)));
 },
 filter(optionsJSON){
  const options=JSON.parse(optionsJSON);
  return JSON.stringify(filterPlaces(places,options).map(placeView));
 },
 brands(query,type){
  return JSON.stringify(searchBrands(BRAND_DIRECTORY,{query,type}).map(brandView));
 }
};
