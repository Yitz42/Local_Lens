import {PMTiles,FetchSource} from 'pmtiles';
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
export const RELEASE='2026-09-23.1';
export const DATA_DATE='2026-09-23T00:00:00Z';
export const ARCHIVE_URL=`https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/${RELEASE}/places.pmtiles`;
export const PAGE_SIZE=4;
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
export function categoryForOverture(properties){
 const basic=String(properties.basic_category||'');
 const taxonomy=parse(properties.taxonomy,{}),hierarchy=taxonomy.hierarchy||[];
 const terms=[basic,taxonomy.primary,...hierarchy].filter(Boolean);
 if(terms.some(t=>/^(gas_station|fuel_station|petrol_station)$/.test(t)))return 'gas';
 if(terms.some(t=>/^(coffee_shop|cafe|cafeteria|tea_house|tea_room|bubble_tea_shop|juice_bar|ice_cream_shop)$/.test(t)))return 'coffee';
 if(terms.some(t=>/^(grocery_store|supermarket|convenience_store|bakery|greengrocer|food_market|specialty_food_store|farmers_market)$/.test(t)))return 'grocery';
 if(terms.some(t=>t==='restaurant'||t==='food_and_drink'||t.includes('restaurant')||t==='fast_food'||t==='food_truck'))return 'restaurant';
 if(terms.some(t=>t==='shopping'||t==='retail'||t==='pharmacy'||t==='drugstore'))return 'other';
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
 return {id:'overture/'+id,name:String(name),brand:String(brand),lat,lng,category,address:address.freeform||'',addressCity:address.locality||'',website:websites.find(v=>typeof v==='string'&&/^https?:\/\//.test(v))||'',cuisine:'',amenity:p.basic_category||'',source:'Overture Maps',release:RELEASE};
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
 return {places:[...places.values()],source:'Overture Maps',release:RELEASE,dataDate:DATA_DATE,fetchedAt:new Date().toISOString(),page,totalPages,complete:totalPages===1};
}
