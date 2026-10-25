export function ownershipCategories(brand={}){const categories=[];if(brand.type==='corporate'||brand.publicListing)categories.push('corporate');if(brand.type==='pe')categories.push('pe');if(!categories.length)categories.push(brand.type||'unknown');return categories;}
export function matchesOwnershipCategory(brand,type){return type==='all'||ownershipCategories(brand).includes(type);}
export function allBrandsFilterState(hidden=[]){const corporate=hidden.includes('corporate'),pe=hidden.includes('pe');return {checked:corporate&&pe,indeterminate:corporate!==pe};}
export function setAllBrandsHidden(hidden=[],hide=true){return hide?[...new Set([...hidden,'pe','corporate'])]:hidden.filter(type=>!['pe','corporate'].includes(type));}
