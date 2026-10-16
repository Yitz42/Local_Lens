export const TYPE_LABELS={corporate:'Corporate brand',pe:'Private equity backed'};
const fold=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchBrands(brands,{query='',type='all'}={}){
 const terms=fold(query).split(' ').filter(Boolean);
 return brands.filter(brand=>brand.type!=='independent'&&(type==='all'||brand.type===type)&&terms.every(term=>fold([brand.brand,brand.parent,...brand.aliases,...(brand.sponsors||[])].join(' ')).includes(term))).sort((a,b)=>a.brand.localeCompare(b.brand));
}
