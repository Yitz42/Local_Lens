// Ranks a BigQuery export from scripts/bigquery-regional-chains.sql against the brand directory. Each row is checked
// at its own center point, so regional brands with a matchBounds guard count. Prints coverage by state and writes
// regional-gaps.tsv (unmatched chains in app categories, largest first) to the output folder.
// Usage: node scripts/rank-regional-gaps.mjs results.csv [output folder, default .]
import {readFileSync,writeFileSync} from 'node:fs';
import {categoryForOverture} from '../worker/overture.js';
import {ownershipFor} from '../public/ownership.js';
function parse(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else quoted=false;}else field+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}else if(c!=='\r')field+=c;}if(field||row.length){row.push(field);rows.push(row);}return rows;}
const [head,...raw]=parse(readFileSync(process.argv[2],'utf8'));
const rows=raw.filter(r=>r.length===head.length).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]])));
const states=new Map(),gaps=[];
for(const r of rows){
 const category=categoryForOverture({'@name':r.example_name,basic_category:r.top_category,taxonomy:JSON.stringify({primary:r.top_category,hierarchy:[r.top_category]})});
 if(!category)continue;
 const n=+r.in_state,s=states.get(r.region)||{shown:0,labeled:0};s.shown+=n;
 const o=ownershipFor({id:r.region+r.name_key,name:r.example_name,brand:'',category,lat:+r.center_lat,lng:+r.center_lng});
 if(o.type!=='unknown')s.labeled+=n;else gaps.push([n,r.region,r.us_locations,category,r.example_name,r.top_domain]);
 states.set(r.region,s);
}
let shown=0,labeled=0;for(const s of states.values()){shown+=s.shown;labeled+=s.labeled;}
console.log(`Regional chain locations in app categories: ${shown}, labeled ${labeled} (${(labeled/shown*100).toFixed(1)}%)`);
for(const [region,s] of [...states].sort((a,b)=>b[1].shown-a[1].shown))console.log(region.padEnd(4),String(s.shown).padStart(6),(s.labeled/s.shown*100).toFixed(0)+'%');
gaps.sort((a,b)=>b[0]-a[0]);
writeFileSync((process.argv[3]||'.')+'/regional-gaps.tsv',gaps.map(g=>g.join('\t')).join('\n'));
