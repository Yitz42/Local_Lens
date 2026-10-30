import {readFileSync,writeFileSync} from 'node:fs';
// Ranks a BigQuery export from scripts/bigquery-chains-detailed.sql against the brand directory.
// Each name is checked at its own center point so regional brands count, and unmatched names that share a
// website domain with a matched brand are listed separately as likely name variants (alias candidates).
// Usage: node scripts/rank-bigquery-gaps.mjs results.csv [output folder, default .]
import {categoryForOverture} from '../worker/overture.js';
import {ownershipFor} from '../public/ownership.js';
const text=readFileSync(process.argv[2],'utf8');
function parse(t){const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c!='\r')f+=c}if(f||row.length){row.push(f);rows.push(row)}return rows}
const [head,...raw]=parse(text);const rows=raw.filter(r=>r.length===head.length).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]])));
const SKIP=new Set(['facebook.com','instagram.com','google.com','yelp.com','business.site','wixsite.com','square.site','squarespace.com','godaddysites.com','weebly.com','wordpress.com','linktr.ee','sites.google.com','toasttab.com','clover.com','order.online','doordash.com','grubhub.com','ubereats.com','yellowpages.com','mapquest.com','nextdoor.com','blogspot.com','ueniweb.com','x.com','twitter.com','tiktok.com','youtube.com','linkedin.com','apple.com','bit.ly','goo.gl','site123.me','wix.com','spotapps.co','menufy.com','chownow.com','zmenu.com','beyondmenu.com','allmenus.com','mybigcommerce.com','myshopify.com','shopify.com','gov','edu','state.us']);
let shown=0,shownLoc=0,matchedLoc=0;const domBrand=new Map(),unmatched=[];
for(const r of rows){const name=r.example_name,cat=r.top_category,loc=+r.locations;
 const c=categoryForOverture({'@name':name,basic_category:cat,taxonomy:JSON.stringify({primary:cat,hierarchy:[cat]})});if(!c)continue;shown++;shownLoc+=loc;
 const o=ownershipFor({id:name,name,brand:r.top_brand||'',category:c,lat:+r.center_lat,lng:+r.center_lng});
 r.cat=c;if(o.type!=='unknown'){matchedLoc+=loc;if(r.top_domain&&!SKIP.has(r.top_domain)){const e=domBrand.get(r.top_domain)||{};e[o.brand]=(e[o.brand]||0)+loc;domBrand.set(r.top_domain,e);}continue;}
 unmatched.push(r);}
const variants=[],fresh=[];
for(const r of unmatched){const d=r.top_domain&&!SKIP.has(r.top_domain)&&domBrand.get(r.top_domain);if(d){const b=Object.entries(d).sort((a,b)=>b[1]-a[1])[0][0];variants.push({...r,brand:b});}else fresh.push(r);}
console.log({names:rows.length,shown,shownLoc,matchedLoc,pct:(matchedLoc/shownLoc*100).toFixed(1),unmatched:unmatched.length,variants:variants.length,variantLoc:variants.reduce((s,r)=>s+ +r.locations,0)});
writeFileSync((process.argv[3]||'.')+'/gap-variants.tsv',variants.map(r=>[r.locations,r.example_name,r.cat,r.top_domain,r.brand,r.top_states].join('\t')).join('\n'));
// group fresh by domain so multi-name chains combine
const groups=new Map();for(const r of fresh){const k=r.top_domain&&!SKIP.has(r.top_domain)?r.top_domain:'name:'+r.name_key;const g=groups.get(k)||{key:k,loc:0,names:[],states:r.top_states,cat:r.cat,maxStates:0};g.loc+= +r.locations;g.names.push(r.example_name);g.maxStates=Math.max(g.maxStates,+r.states);groups.set(k,g);}
const ranked=[...groups.values()].sort((a,b)=>b.loc-a.loc);
writeFileSync((process.argv[3]||'.')+'/gap-chains.tsv',ranked.map(g=>[g.loc,g.maxStates,g.cat,g.key,g.names.slice(0,4).join(' | '),g.states].join('\t')).join('\n'));
console.log('fresh groups',ranked.length);
