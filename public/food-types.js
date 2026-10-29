import {kosherListingFor} from './kosher-places.js?v=20261029-kosher1';
export const OWNERSHIP_PREFERENCE_KEY='local-lens-hidden-v2';
export const DEFAULT_OWNERSHIP_FILTERS=['pe','corporate'];
export function initialOwnershipFilters(stored){
 if(!Array.isArray(stored))return [...DEFAULT_OWNERSHIP_FILTERS];
 const valid=[...new Set(stored.filter(type=>['pe','corporate','unknown'].includes(type)))];
 return stored.length&&!valid.length?[...DEFAULT_OWNERSHIP_FILTERS]:valid;
}
// Dietary types are requirements: a place must match every one selected. Cuisines match any selected.
export const FOOD_TYPES=[
 {id:'kosher',name:'Kosher',diet:true,terms:['kosher','kosher_restaurant','kosher_food','kosher_store','kosher_grocery_store'],namePattern:/\b(kosher|glatt|cholov yisroel|chalav yisrael|pas yisroel|star[- ]?k)\b(?![- ]style)/i},
 {id:'halal',name:'Halal',diet:true,terms:['halal','halal_restaurant','halal_food','halal_store','halal_grocery_store'],namePattern:/\b(halal|zabiha|zabihah)\b/i},
 {id:'vegetarian',name:'Vegetarian',diet:true,terms:['vegetarian','vegetarian_restaurant','vegan','vegan_restaurant'],namePattern:/\b(vegetarian|vegan)\b/i},
 {id:'vegan',name:'Vegan',diet:true,terms:['vegan','vegan_restaurant'],namePattern:/\bvegan\b/i},
 {id:'italian',name:'Italian',terms:['italian','italian_restaurant','northern_italian_restaurant','southern_italian_restaurant']},
 {id:'pizza',name:'Pizza',terms:['pizza','pizzeria','pizza_restaurant','pizza_delivery','pizza_takeaway','neapolitan_pizza_restaurant']},
 {id:'mexican',name:'Mexican',terms:['mexican','mexican_restaurant','tex_mex','tex_mex_restaurant']},
 {id:'chinese',name:'Chinese',terms:['chinese','chinese_restaurant']},
 {id:'japanese',name:'Japanese',terms:['japanese','japanese_restaurant']},
 {id:'sushi',name:'Sushi',terms:['sushi','sushi_restaurant','sushi_bar']},
 {id:'indian',name:'Indian',terms:['indian','indian_restaurant','north_indian_restaurant','south_indian_restaurant']},
 {id:'thai',name:'Thai',terms:['thai','thai_restaurant']},
 {id:'american',name:'American',terms:['american','american_restaurant','new_american_restaurant','traditional_american_restaurant']},
 {id:'burgers',name:'Burgers',terms:['burger','burgers','hamburger','hamburgers','burger_restaurant','hamburger_restaurant']},
 {id:'barbecue',name:'BBQ',terms:['barbecue','bbq','barbecue_restaurant','bbq_restaurant','texas_barbecue_restaurant']},
 {id:'seafood',name:'Seafood',terms:['seafood','seafood_restaurant']},
 {id:'mediterranean',name:'Mediterranean',terms:['mediterranean','mediterranean_restaurant']},
 {id:'greek',name:'Greek',terms:['greek','greek_restaurant']},
 {id:'french',name:'French',terms:['french','french_restaurant']},
 {id:'sandwiches',name:'Sandwiches',terms:['sandwich','sandwiches','sandwich_shop','sandwich_restaurant']}
];
const normalise=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
// Food categories where a dietary label makes sense.
export const DIET_CATEGORIES=['restaurant','coffee','grocery','bar'];
export const isDietType=id=>!!FOOD_TYPES.find(type=>type.id===id)?.diet;
export function foodTypesFromTerms(input=[],name=''){
 const terms=new Set((Array.isArray(input)?input:[input]).flat(2).filter(value=>typeof value==='string').flatMap(value=>value.split(/[;,|·]/)).map(normalise));
 return FOOD_TYPES.filter(type=>terms.has(type.id)||type.terms.some(term=>terms.has(term))||(type.namePattern?.test(name)??false)).map(type=>type.id);
}
// Kosher also comes from certified listings and from places a person marked kosher themselves.
export function foodTypesForPlace(place){return [...new Set([...foodTypesFromTerms([place.foodTypes||[],place.cuisine||'']),...foodTypesFromTerms([],place.name||'').filter(isDietType),...(place.myKosher||place.osmKosher||kosherListingFor(place)?['kosher']:[])])];}
export function foodTypeLabel(place){const ids=foodTypesForPlace(place);return FOOD_TYPES.filter(type=>ids.includes(type.id)).map(type=>type.name).join(' · ');}
export function matchesFoodTypes(place,selected=[]){
 if(!selected.length)return true;
 const ids=foodTypesForPlace(place),diets=selected.filter(isDietType),cuisines=selected.filter(id=>!isDietType(id));
 if(diets.length&&!(DIET_CATEGORIES.includes(place.category)&&diets.every(id=>ids.includes(id))))return false;
 return !cuisines.length||cuisines.some(id=>ids.includes(id));
}
