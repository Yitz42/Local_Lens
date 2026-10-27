export function ownershipCategories(brand={}){const categories=[];if(brand.type==='corporate'||brand.publicListing)categories.push('corporate');if(brand.type==='pe')categories.push('pe');if(!categories.length)categories.push(brand.type||'unknown');return categories;}
export function matchesOwnershipCategory(brand,type){return type==='all'||(type==='local'?!!LOCAL_OPERATORS[brand.localOperators]:ownershipCategories(brand).includes(type));}
// Brands whose US locations are mostly owned by local franchisees, dealers, or co-op members.
export const LOCAL_OPERATORS={franchise:'Most locations are owned and run by local franchisees.',dealer:'Most locations are owned and run by independent dealers or station owners.',cooperative:'Stores are independently owned members of a retailer-owned cooperative.'};
export function localOperatorNote(brand={}){return LOCAL_OPERATORS[brand.localOperators]||'';}
export function allBrandsFilterState(hidden=[]){const corporate=hidden.includes('corporate'),pe=hidden.includes('pe');return {checked:corporate&&pe,indeterminate:corporate!==pe};}
export function setAllBrandsHidden(hidden=[],hide=true){return hide?[...new Set([...hidden,'pe','corporate'])]:hidden.filter(type=>!['pe','corporate'].includes(type));}
