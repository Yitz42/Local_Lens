export function ownershipCategories(brand={}){const categories=[];if(brand.type==='corporate'||brand.publicListing)categories.push('corporate');if(brand.type==='pe')categories.push('pe');if(!categories.length)categories.push(brand.type||'unknown');return categories;}
export function matchesOwnershipCategory(brand,type){return type==='all'||ownershipCategories(brand).includes(type);}
