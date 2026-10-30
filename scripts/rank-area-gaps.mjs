// Ranks a BigQuery export from scripts/bigquery-maryland-chains.sql (or the same query for another area) against
// the brand directory, by locations in the home state. Usage: node scripts/rank-area-gaps.mjs results.csv [lat lng]
import {readFileSync,writeFileSync} from 'node:fs';
import {categoryForOverture} from '../worker/overture.js';
import {ownershipFor} from '../public/ownership.js';
function parse(t){const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c!='\r')f+=c}if(f||row.length){row.push(f);rows.push(row)}return rows}
const [h,...raw]=parse(readFileSync(process.argv[2],'utf8'));const rows=raw.filter(r=>r.length===h.length).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));
let shown=0,matched=0;const out=[];
for(const r of rows){const md=+r.in_maryland;const c=categoryForOverture({'@name':r.example_name,basic_category:r.top_category,taxonomy:JSON.stringify({primary:r.top_category,hierarchy:[r.top_category]})});if(!c)continue;shown+=md;
 const o=ownershipFor({id:r.name_key,name:r.example_name,brand:'',category:c,lat:+(process.argv[3]||39.29),lng:+(process.argv[4]||-76.61)});if(o.type!=='unknown'){matched+=md;continue;}out.push([md,r.locations,c,r.example_name,r.top_domain].join('\t'));}
console.log('MD chain locations in app categories',shown,'labeled',matched,(matched/shown*100).toFixed(1)+'%');
writeFileSync('area-gaps.tsv',out.join('\n'));
