export function ownershipCategories(brand={}){const categories=[];if(brand.type==='corporate'||brand.publicListing)categories.push('corporate');if(brand.type==='pe')categories.push('pe');if(!categories.length)categories.push(brand.type||'unknown');return categories;}
export function matchesOwnershipCategory(brand,type){return type==='all'||(type==='local'?!!LOCAL_OPERATORS[brand.localOperators]:ownershipCategories(brand).includes(type));}
// Brands whose US locations are mostly owned by local franchisees, dealers, or co-op members.
// Labeled by where the money goes: franchise and dealer fees and supply flow mostly to the brand owner,
// while co-op and licensed independent stores keep most of it with the local owner.
export const LOCAL_OPERATORS={
 franchise:{label:'Local franchise owner',note:'Most locations are owned by local franchisees, but royalties, marketing fees, required supplies, and often rent go to the brand owner, so it stays labeled by its corporate owner.'},
 dealer:{label:'Independent dealer',note:'Most locations are owned by independent dealers or station owners, but most sales go to the brand for fuel, service, or merchandise, so it stays labeled by its corporate owner.'},
 cooperative:{label:'Co-op member store',note:'Stores are owned by local members of a cooperative that returns its earnings to members, so most of the money stays local.'},
 licensed:{label:'Independent licensee',note:'Stores are independently owned grocers paying a small fee to use the banner, so most of the money stays local.'}
};
export function localOperatorNote(brand={}){return LOCAL_OPERATORS[brand.localOperators]?.note||'';}
export function localOperatorLabel(brand={}){return LOCAL_OPERATORS[brand.localOperators]?.label||'';}
export function isListedBrand(brand={}){return brand.type!=='independent'||!!LOCAL_OPERATORS[brand.localOperators];}
export function allBrandsFilterState(hidden=[]){const corporate=hidden.includes('corporate'),pe=hidden.includes('pe');return {checked:corporate&&pe,indeterminate:corporate!==pe};}
export function setAllBrandsHidden(hidden=[],hide=true){return hide?[...new Set([...hidden,'pe','corporate'])]:hidden.filter(type=>!['pe','corporate'].includes(type));}
