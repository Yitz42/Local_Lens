// Lists chain names that appear unmatched in several metro areas, most widespread first, so new research
// goes to the brands people actually see. Usage: node scripts/find-gaps.mjs [minimum cities, default 3]
import {PMTiles,FetchSource} from 'pmtiles';
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {planTiles,ARCHIVE_URL,categoryForOverture} from '../worker/overture.js';
import {ownershipFor} from '../public/ownership.js';
const a=new PMTiles(new FetchSource(ARCHIVE_URL));
const cities=[[39.3725,-76.7238],[36.15,-86.80],[32.90,-96.77],[33.50,-112.07],[41.88,-87.95],[33.85,-84.36],[29.75,-95.46],[39.95,-75.17],[47.61,-122.20],[28.54,-81.38],[42.33,-83.25],[39.10,-84.51]];
const counts=new Map();
for(const [lat,lng] of cities){const seen=new Set();for(const {z,x,y} of planTiles(lat,lng,6000)){const r=await a.getZxy(z,x,y);if(!r)continue;const l=new VectorTile(new PbfReader(new Uint8Array(r.data))).layers.place;if(!l)continue;
for(let i=0;i<l.length;i++){const p=l.feature(i).properties;const c=categoryForOverture(p);const name=p['@name'];if(!name)continue;const id=name+(p['@id']||i);if(seen.has(id))continue;seen.add(id);
const tax=(()=>{try{return JSON.parse(p.taxonomy||'{}').primary||p.basic_category}catch{return p.basic_category}})();
const o=ownershipFor({id,name,brand:p.brand_name||'',category:c||'other',lat,lng});if(o.type!=='unknown')continue;
const key=name.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();const e=counts.get(key)||{name,n:0,cities:new Set(),cats:new Map()};e.n++;e.cities.add(lat);e.cats.set((c||'-')+'/'+tax,(e.cats.get((c||'-')+'/'+tax)||0)+1);counts.set(key,e);}}}
const rows=[...counts.values()].filter(e=>e.cities.size>=(Number(process.argv[2])||3)).sort((x,y)=>y.cities.size-x.cities.size||y.n-x.n);
for(const e of rows.slice(0,400))console.log(e.cities.size,e.n,e.name,'|',[...e.cats].sort((x,y)=>y[1]-x[1])[0][0]);
