import {matchesOwnershipCategory,isListedBrand} from './ownership-categories.js?v=20261027-local5';
export const TYPE_LABELS={corporate:'Corporate brand',pe:'Private equity backed',independent:'Independent / co-op'};
const fold=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchBrands(brands,{query='',type='all'}={}){
 const terms=fold(query).split(' ').filter(Boolean);
 return brands.filter(brand=>isListedBrand(brand)&&matchesOwnershipCategory(brand,type)&&terms.every(term=>fold([brand.brand,brand.parent,...brand.aliases,...(brand.sponsors||[]),brand.publicListing?.company||'',...(brand.publicListing?.exchanges||[]).flatMap(listing=>[listing.exchange,listing.ticker])].join(' ')).includes(term))).sort((a,b)=>a.brand.localeCompare(b.brand));
}
