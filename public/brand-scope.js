// Broad coverage and service-area guards, not administrative boundaries or store-level verification.
const US_COVERAGE=[
 {south:24,west:-126,north:50,east:-66},
 {south:18,west:-161.5,north:23,east:-154},
 {south:51,west:-180,north:72,east:-129},
 {south:51,west:170,north:72,east:180},
 {south:17.5,west:-67.5,north:18.7,east:-64.4}
];
export function pointInBounds(place,bounds){return Number.isFinite(place.lat)&&Number.isFinite(place.lng)&&place.lat>=bounds.south&&place.lat<=bounds.north&&place.lng>=bounds.west&&place.lng<=bounds.east;}
export function inUSCoverage(place){return US_COVERAGE.some(bounds=>pointInBounds(place,bounds));}
export function matchesBrandScope(place,brand){return !brand.matchBounds||brand.matchBounds.some(bounds=>pointInBounds(place,bounds));}
export function boundsOverlap(a,b){return a.south<=b.north&&a.north>=b.south&&a.west<=b.east&&a.east>=b.west;}
export function haveDisjointScopes(a,b){return Array.isArray(a.matchBounds)&&a.matchBounds.length>0&&Array.isArray(b.matchBounds)&&b.matchBounds.length>0&&!a.matchBounds.some(one=>b.matchBounds.some(two=>boundsOverlap(one,two)));}
// Store categories split from More stores. A brand guard of 'other' still covers every retail store category.
export const PLACE_CATEGORIES=['restaurant','grocery','gas','coffee','pharmacy','home','apparel','general','other'];
export const RETAIL_CATEGORIES=['pharmacy','home','apparel','general','other'];
export function matchesBrandCategory(place,brand){return !brand.matchCategories||brand.matchCategories.includes(place.category)||RETAIL_CATEGORIES.includes(place.category)&&brand.matchCategories.includes('other');}
