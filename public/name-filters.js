import {BRAND_DIRECTORY} from './brand-directory.js?v=20261030-rounds5';
import {ownershipCategories} from './ownership-categories.js?v=20261030-rounds5';
import {inUSCoverage,matchesBrandScope,matchesBrandCategory} from './brand-scope.js?v=20261030-rounds5';

export const NAME_FILTERS_KEY='local-lens-name-filters-v1';
export const MAX_HIDDEN_NAMES=100;
export const MAX_NAME_LENGTH=80;
const words=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/['’‘]/g,'').match(/[\p{L}\p{N}]+/gu)||[];
const key=value=>words(value).join('');
export function cleanHiddenNames(value=[]){
 if(!Array.isArray(value))return [];
 const seen=new Set(),names=[];
 for(const input of value){if(typeof input!=='string')continue;const name=input.trim(),id=key(name);if(!id||name.length>MAX_NAME_LENGTH||seen.has(id))continue;seen.add(id);names.push(name);if(names.length===MAX_HIDDEN_NAMES)break;}
 return names;
}
export function initialNameFilters(value){return {matchBrandNames:typeof value?.matchBrandNames==='boolean'?value.matchBrandNames:true,hiddenNames:cleanHiddenNames(value?.hiddenNames)};}
// Complete word sequences permit punctuation/spacing variants such as 7-Eleven / 7 Eleven.
// They do not turn Shell into a match inside Seashell or CVS into a match inside CVSish.
function nameKeys(value){const tokens=words(value).slice(0,120),keys=new Set();for(let start=0;start<tokens.length;start++){let part='';for(let end=start;end<tokens.length;end++){part+=tokens[end];if(part.length>240)break;keys.add(part);}}return keys;}
export function hiddenNameMatch(place,names=[]){const cleaned=cleanHiddenNames(names);if(!cleaned.length)return null;const keys=nameKeys(place.name);return cleaned.find(name=>keys.has(key(name)))||null;}
function literalNameMatch(value,name){const text=String(value).toLowerCase().normalize('NFKC'),term=name.toLowerCase().normalize('NFKC');let at=text.indexOf(term);while(at>=0){if(!/[\p{L}\p{N}]/u.test(text[at-1]||'')&&!/[\p{L}\p{N}]/u.test(text[at+term.length]||''))return true;at=text.indexOf(term,at+1);}return false;}
const index=new Map();
for(const brand of BRAND_DIRECTORY){
 if(brand.type==='independent')continue;
 for(const name of [brand.brand,...brand.aliases]){const id=key(name);if(!index.has(id))index.set(id,[]);if(!index.get(id).includes(brand))index.get(id).push(brand);}
}
export function excludedBrandNameMatch(place,hidden=[]){
 if(!inUSCoverage(place))return null;
 if(!hidden.some(type=>['corporate','pe'].includes(type)))return null;
 const candidates=[{value:place.brand,explicit:true},{value:place.name,explicit:false}].filter(candidate=>candidate.value);
 for(const candidate of candidates)for(const id of [...nameKeys(candidate.value)].sort((a,b)=>b.length-a.length))for(const brand of index.get(id)||[]){
  if(!matchesBrandScope(place,brand))continue;
  const exactBrand=candidate.explicit&&String(candidate.value).split(';').some(component=>key(component)===id);
  if(!exactBrand&&!matchesBrandCategory(place,brand))continue;
  if(brand.preservePunctuation&&![brand.brand,...brand.aliases].some(alias=>literalNameMatch(candidate.value,alias)))continue;
  if(ownershipCategories(brand).some(type=>hidden.includes(type)))return brand;
 }
 return null;
}
