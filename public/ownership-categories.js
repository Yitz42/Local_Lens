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
// "How local?" slider: which locally run models may stay visible while corporate or PE brands are hidden.
// The default keeps co-op and licensed independents, whose money mostly stays local.
export const LOCAL_LEVELS=[
 {label:'Independent only',detail:'Also hide co-op and licensed member stores such as Ace Hardware and IGA.',models:[],hide:['cooperative','licensed']},
 {label:'Locally owned',detail:'Show independents and co-op member stores; hide franchise and dealer locations of hidden brands.',models:[]},
 {label:'Include local franchise owners',detail:'Also show franchise locations owned by local operators.',models:['franchise']},
 {label:'Include franchises and dealers',detail:'Also show dealer-run locations such as branded gas stations.',models:['franchise','dealer']}
];
export const DEFAULT_LOCAL_LEVEL=1;
export function cleanLocalLevel(value){return Number.isInteger(value)&&value>=0&&value<LOCAL_LEVELS.length?value:DEFAULT_LOCAL_LEVEL;}
export function hidesLocalOperator(level,brand={}){return !!LOCAL_LEVELS[cleanLocalLevel(level)].hide?.includes(brand?.localOperators);}
export function allowsLocalOperator(level,brand={}){return LOCAL_LEVELS[cleanLocalLevel(level)].models.includes(brand?.localOperators);}
export function isListedBrand(brand={}){return brand.type!=='independent'||!!LOCAL_OPERATORS[brand.localOperators];}
export function allBrandsFilterState(hidden=[]){const corporate=hidden.includes('corporate'),pe=hidden.includes('pe');return {checked:corporate&&pe,indeterminate:corporate!==pe};}
export function setAllBrandsHidden(hidden=[],hide=true){return hide?[...new Set([...hidden,'pe','corporate'])]:hidden.filter(type=>!['pe','corporate'].includes(type));}
