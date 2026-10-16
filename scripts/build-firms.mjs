import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const key=value=>value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
export function validateFirms(data){
 if(data.version!==1||!Array.isArray(data.firms))throw new Error('A firm catalog is required');
 const names=new Set();
 for(const firm of data.firms){
  if(typeof firm.firm!=='string'||!firm.firm||names.has(key(firm.firm)))throw new Error('Missing or duplicate firm name');names.add(key(firm.firm));
  if(!Array.isArray(firm.aliases)||firm.aliases.some(alias=>typeof alias!=='string')||typeof firm.notes!=='string')throw new Error('Firm aliases and notes required');
  if(!['reviewed','partial','not_reviewed'].includes(firm.status)||!Array.isArray(firm.holdings))throw new Error('Invalid review state for '+firm.firm);
  if(firm.status!=='not_reviewed'&&(!firm.source||new URL(firm.source).protocol!=='https:'||!/^\d{4}-\d{2}-\d{2}$/.test(firm.checked)))throw new Error('Review evidence required for '+firm.firm);
  if(firm.status==='not_reviewed'&&firm.holdings.length)throw new Error('Unreviewed holdings cannot be published for '+firm.firm);
  for(const holding of firm.holdings)for(const field of ['company','relationship','source','sourceTitle','note'])if(typeof holding[field]!=='string'||!holding[field].trim())throw new Error('Missing holding evidence on '+firm.firm);
  for(const holding of firm.holdings)if(new URL(holding.source).protocol!=='https:')throw new Error('HTTPS holding source required');
 }
 return data;
}
const cell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const md=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n',' ');
export async function generateFirms(){
 const data=validateFirms(JSON.parse(await readFile(new URL('data/pe-firms.json',root),'utf8')));
 const brands=JSON.parse(await readFile(new URL('data/brands.json',root),'utf8')).brands;
 const firms=data.firms.map(firm=>({...firm,mappedBrands:brands.filter(brand=>brand.sponsors?.includes(firm.firm)).sort((a,b)=>a.brand.localeCompare(b.brand,'en')).map(brand=>({brand:brand.brand,parent:brand.parent,type:brand.type,source:brand.source,checked:brand.checked}))})).sort((a,b)=>a.firm.localeCompare(b.firm));
 const {firms:unused,...meta}=data,reviewed=firms.filter(firm=>firm.status!=='not_reviewed');
 const payload={...meta,reviewedCount:reviewed.length,firmCount:firms.length,holdingCount:firms.reduce((n,firm)=>n+firm.holdings.length,0),firms};
 await mkdir(new URL('docs/',root),{recursive:true});
 await writeFile(new URL('public/pe-firms.json',root),JSON.stringify(payload,null,2)+'\n');
 await writeFile(new URL('public/pe-firm-directory.js',root),'// Generated from data/pe-firms.json and data/brands.json.\nexport const FIRM_CATALOG = '+JSON.stringify(payload,null,2)+';\n');
 const fields=['firm','company','relationship','source','sourceTitle','note','checked'];
 const rows=reviewed.flatMap(firm=>firm.holdings.map(holding=>({...holding,firm:firm.firm,checked:firm.checked})));
 await writeFile(new URL('public/pe-holdings.csv',root),[fields.map(cell).join(','),...rows.map(row=>fields.map(field=>cell(row[field])).join(','))].join('\r\n')+'\r\n');
 let document='# Private equity firms and selected holdings\n\nResearch seed: [Wikipedia list of private equity firms]('+data.seed+') ([snapshot]('+data.snapshot+')). Firm names from the seed are a research queue and may include historical names, venture firms, or merged businesses. A place in this catalog is not proof of any particular ownership relationship.\n\n'+reviewed.length+' of '+firms.length+' catalog entries have recorded portfolio research. Selected holdings and mapped brands are sourced; this is not a complete inventory of any firm’s investments. Minority stakes, growth investments, portfolio-company brands, and franchises require the scope stated in each record. Unreviewed firms remain explicitly unreviewed.\n\n';
 for(const firm of reviewed){
  document+='## '+md(firm.firm)+'\n\nReview: '+firm.checked+' · '+(firm.status==='partial'?'Partial evidence':'Selected evidence checked')+' · [Portfolio / source]('+firm.source+')\n\n'+md(firm.notes)+'\n\n';
  if(firm.holdings.length){document+='| Company / brand | Investment relationship | Source | Scope |\n| --- | --- | --- | --- |\n';for(const holding of firm.holdings)document+='| '+[md(holding.company),md(holding.relationship),'['+md(holding.sourceTitle)+']('+holding.source+')',md(holding.note)].join(' | ')+' |\n';}
  if(firm.mappedBrands.length)document+='\nBrands in Local Lens: '+firm.mappedBrands.map(brand=>md(brand.brand)).join(', ')+'.\n';
  document+='\n';
 }
 document+='## Research queue\n\nThe following entries have no recorded current-portfolio conclusion in this release. Empty holdings never mean a firm owns nothing.\n\n<details>\n<summary>Unreviewed firms from the Wikipedia seed</summary>\n\n'+firms.filter(firm=>firm.status==='not_reviewed').map(firm=>'- '+md(firm.firm)).join('\n')+'\n\n</details>\n';
 await writeFile(new URL('docs/PRIVATE_EQUITY_FIRMS.md',root),document);
 console.log('Generated firm catalog: '+reviewed.length+' researched / '+firms.length+' listed, '+payload.holdingCount+' selected holdings.');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await generateFirms();
