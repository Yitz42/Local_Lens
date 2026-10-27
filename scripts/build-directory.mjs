import {ownershipCategories} from '../public/ownership-categories.js';
import {haveDisjointScopes,PLACE_CATEGORIES} from '../public/brand-scope.js';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const key=value=>value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
export function validateDirectory(data){
 if(data.version!==1||!Array.isArray(data.brands)||!data.brands.length)throw new Error('Directory version and brands are required');
 const names=new Map();
 for(const brand of data.brands){
  for(const field of ['brand','parent','source','sourceTitle','note','checked'])if(typeof brand[field]!=='string'||!brand[field].trim())throw new Error('Missing '+field+' on '+brand.brand);
  if(!['corporate','pe','independent'].includes(brand.type))throw new Error('Invalid category for '+brand.brand);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(brand.checked)||!Number.isFinite(Date.parse(brand.checked)))throw new Error('Invalid review date for '+brand.brand);
  if(new URL(brand.source).protocol!=='https:')throw new Error('Source must use HTTPS for '+brand.brand);
  if(brand.wikipedia){const url=new URL(brand.wikipedia);if(url.protocol!=='https:'||url.hostname!=='en.wikipedia.org'||!url.pathname.startsWith('/wiki/'))throw new Error('Invalid Wikipedia reference for '+brand.brand);}
  if(brand.discoverySources){
   if(!Array.isArray(brand.discoverySources))throw new Error('Invalid discovery sources for '+brand.brand);
   for(const reference of brand.discoverySources)if(!reference||typeof reference.title!=='string'||!reference.title.trim()||typeof reference.url!=='string'||new URL(reference.url).protocol!=='https:')throw new Error('Invalid discovery source for '+brand.brand);
  }
  if(brand.publicListing){
   const listing=brand.publicListing;
   if(brand.type==='independent'||!['self','brand_owner'].includes(listing.relationship)||!listing.company||!listing.sourceTitle||!listing.checked||!/^\d{4}-\d{2}-\d{2}$/.test(listing.checked)||!Number.isFinite(Date.parse(listing.checked))||new URL(listing.source).protocol!=='https:'||listing.securityType!=='equity'||!Array.isArray(listing.exchanges)||!listing.exchanges.length||listing.exchanges.some(item=>typeof item.exchange!=='string'||!item.exchange.trim()||typeof item.ticker!=='string'||!item.ticker.trim()))throw new Error('Invalid public equity listing for '+brand.brand);
  }
  if(!Array.isArray(brand.aliases)||brand.aliases.some(alias=>typeof alias!=='string'||!key(alias)))throw new Error('Invalid aliases for '+brand.brand);
  if(brand.matchCategories&&(!Array.isArray(brand.matchCategories)||!brand.matchCategories.length||brand.matchCategories.some(category=>!PLACE_CATEGORIES.includes(category))))throw new Error('Invalid matching category for '+brand.brand);
  if(brand.preservePunctuation!==undefined&&typeof brand.preservePunctuation!=='boolean')throw new Error('Invalid punctuation rule for '+brand.brand);
  if(brand.sponsors&&(!Array.isArray(brand.sponsors)||brand.sponsors.some(sponsor=>typeof sponsor!=='string'||!sponsor.trim())))throw new Error('Invalid sponsors for '+brand.brand);
  if(brand.matchBounds!==undefined&&(!Array.isArray(brand.matchBounds)||!brand.matchBounds.length||brand.matchBounds.some(bounds=>!bounds||!['south','west','north','east'].every(field=>Number.isFinite(bounds[field]))||bounds.south< -90||bounds.north>90||bounds.west< -180||bounds.east>180||bounds.south>=bounds.north||bounds.west>=bounds.east)))throw new Error('Invalid geographic scope for '+brand.brand);
  for(const alias of [brand.brand,...brand.aliases]){
   const normalized=key(alias),existing=names.get(normalized)||[];
   for(const other of existing)if(other!==brand&&!haveDisjointScopes(other,brand))throw new Error('Ambiguous alias '+alias+' on '+other.brand+' and '+brand.brand);
   if(!existing.includes(brand))existing.push(brand);names.set(normalized,existing);
  }
 }
 return data;
}
function csvCell(value){const text=String(value??'');return '"'+(/^[=+@-]/.test(text)?'\t':'')+text.replaceAll('"','""')+'"';}
function markdown(value){return String(value).replaceAll('|','\\|').replaceAll('\n',' ');}
export async function generateDirectory(){
 const data=validateDirectory(JSON.parse(await readFile(new URL('data/brands.json',root),'utf8')));
 data.brands.sort((a,b)=>a.brand.localeCompare(b.brand,'en'));
 const {brands:sourceBrands,...meta}=data,brands=sourceBrands.map(brand=>({...brand,categories:ownershipCategories(brand)})),listed=brands.filter(brand=>brand.type!=='independent');
 const labels={corporate:'Corporate brand',pe:'Private equity backed'};
 const fields=['brand','type','parent','aliases','source','sourceTitle','note','checked','wikipedia','discoverySources','categories','publicListing','matchBounds','sponsors'];
 const csv=[fields.map(csvCell).join(','),...listed.map(brand=>fields.map(field=>csvCell(field==='discoverySources'||field==='publicListing'||field==='matchBounds'?brand[field]?JSON.stringify(brand[field]):'':Array.isArray(brand[field])?brand[field].join('; '):brand[field])).join(','))].join('\r\n')+'\r\n';
 await mkdir(new URL('docs/',root),{recursive:true});
 await writeFile(new URL('public/brand-directory.js',root),'// Generated from data/brands.json by npm run directory. Do not edit this file.\nexport const DIRECTORY_META = '+JSON.stringify(meta,null,2)+';\nexport const BRAND_DIRECTORY = '+JSON.stringify(brands,null,2)+';\n');
 await writeFile(new URL('public/brands.json',root),JSON.stringify({...meta,brands:listed},null,2)+'\n');
 await writeFile(new URL('public/brands.csv',root),csv);
 let md='# Corporate and private equity brand directory\n\n'+data.coverage+'\n\n'+listed.length+' distinct brands, with overlapping categories: '+listed.filter(b=>b.categories.includes('corporate')).length+' corporate and '+listed.filter(b=>b.type==='pe').length+' private equity backed. Review dates are recorded per entry. This is a reviewed directory, not a complete list of every brand or an automatic ownership feed.\n\nFilters describe brand affiliation. They do not verify the owner of an individual franchise, licensed store, or fuel station. Corporate includes every verified stock-exchange-listed company and its owned brands, regardless of size, plus large private chains. Publicly traded companies with PE backing appear in both sections and match either exclusion filter. A listed financial sponsor alone does not make its private portfolio companies public. Regional records use geographic matching guards when unrelated chains share a name; the coordinates do not verify an individual store’s owner. PE includes documented minority investments, explained per entry. Unknown businesses are never assumed independent. Former-chain records, including Rite Aid and Bartell Drugs, identify legacy brand affiliation; their notes describe closures and do not establish that a location is still open.\n\nEdit `data/brands.json`, then run `npm run directory`, `npm test`, and `npm run build`. The app matcher, browser list, JSON, CSV, and this document are generated from the same records.\n';
 for(const type of ['corporate','pe']){
  md+='\n## '+labels[type]+'\n\n| Brand | Parent / backing | Reviewed | Source |\n| --- | --- | --- | --- |\n';
  for(const brand of listed.filter(b=>b.categories.includes(type)))md+='| '+[markdown(brand.brand),markdown(brand.parent),brand.checked,'['+markdown(brand.sourceTitle)+']('+brand.source+')'+(brand.publicListing?' · [Stock listing: '+markdown(brand.publicListing.exchanges.map(listing=>listing.exchange+': '+listing.ticker).join('; '))+']('+brand.publicListing.source+')':'')+(brand.wikipedia?' · [Wikipedia]('+brand.wikipedia+')':'')+(brand.discoverySources||[]).map(reference=>' · ['+markdown(reference.title)+']('+reference.url+')').join('')].join(' | ')+' |\n';
 }
 await writeFile(new URL('docs/BRANDS.md',root),md);
 const discovered=listed.filter(brand=>brand.wikipedia);
 let research='# Brands added through Wikipedia research\n\nWikipedia articles and lists were used to find gaps in the directory, including the supplied [private equity portfolio companies category](https://en.wikipedia.org/wiki/Category:Private_equity_portfolio_companies), the [list of private equity firms](https://en.wikipedia.org/wiki/List_of_private_equity_firms), the supplied [US supermarket chain list](https://en.wikipedia.org/wiki/List_of_supermarket_chains_in_the_United_States), the [US restaurant chain list](https://en.wikipedia.org/wiki/List_of_restaurant_chains_in_the_United_States), and the [North American gas station chain list](https://en.wikipedia.org/wiki/List_of_gas_station_chains_in_North_America). The category explicitly includes both current and former investments. Current company, investor, or regulatory sources support the ownership classifications. The Wikipedia link may describe the brand, its parent, or the list where it was discovered.\n\n'+discovered.length+' reviewed brands have a Wikipedia research reference. The primary source and per-brand review date remain the ownership evidence; Wikipedia can contain historical owners or pending transactions.\n\n| Brand | Classification | Parent / backing | Reviewed | Wikipedia reference | Ownership source |\n| --- | --- | --- | --- | --- | --- |\n';
 for(const brand of discovered)research+='| '+[markdown(brand.brand),labels[brand.type],markdown(brand.parent),brand.checked,'[Wikipedia]('+brand.wikipedia+')','['+markdown(brand.sourceTitle)+']('+brand.source+')'].join(' | ')+' |\n';
 await writeFile(new URL('docs/WIKIPEDIA_ADDITIONS.md',root),research);
 console.log('Generated directory: '+listed.length+' corporate and private equity brands, '+(brands.length-listed.length)+' local independent references.');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await generateDirectory();
