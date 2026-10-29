// Kosher-certified places from certifying agencies' own listings and kosher directories.
// A place matches when its name matches and it is within MATCH_METERS of the listed spot,
// so a chain such as Dunkin' only counts at the certified location.
const STAR_K_RETAIL='https://www.star-k.org/retail-establishments';
const starK=id=>`https://apiservice.star-k.org/api/Loc/LoadLoc/${id}`;
export const KOSHER_CHECKED='2026-10-29';
export const KOSHER_PLACES=[
 {name:'Seven Mile Market',address:'201 Reisterstown Rd, Pikesville, MD',lat:39.36571,lng:-76.71270,agency:'Star-K',source:starK('OOOAE3QA'),sourceTitle:'Star-K — Seven Mile Market certificate'},
 {name:'Market Maven',aliases:['Meat Maven',"Rollmaster's Sushi"],address:'1630 Reisterstown Rd, Pikesville, MD',lat:39.37914,lng:-76.72858,agency:'Star-K',source:starK('O512QMI7'),sourceTitle:'Star-K — Market Maven / Meat Maven certificate'},
 {name:"Goldberg's",address:'1500 Reisterstown Rd, Suite 211, Pikesville, MD',lat:39.37694,lng:-76.72647,agency:'Star-K',source:starK('QA0899Q7'),sourceTitle:"Star-K — Goldberg's Kosher Bagels certificate"},
 {name:"Mama Leah's",address:'1500 Reisterstown Rd, Suite 222, Pikesville, MD',lat:39.37648,lng:-76.72610,agency:'Star-K',source:STAR_K_RETAIL,sourceTitle:'Star-K — retail establishments'},
 {name:'The Club Deli',aliases:['Club Deli'],address:'1500 Reisterstown Rd, Suite 224, Pikesville, MD',lat:39.37650,lng:-76.72609,agency:'Star-K',source:starK('PWM6OJDE'),sourceTitle:'Star-K — The Club Deli & Grill certificate'},
 {name:'Croustille',address:'1404A Reisterstown Rd, Pikesville, MD',lat:39.37615,lng:-76.72563,agency:'Star-K',source:STAR_K_RETAIL,sourceTitle:'Star-K — retail establishments'},
 {name:'Knish Shop',address:'508 Reisterstown Rd, Pikesville, MD',lat:39.36765,lng:-76.71699,agency:'Star-K',source:STAR_K_RETAIL,sourceTitle:'Star-K — retail establishments'},
 {name:"Caramel's",address:'700 Reisterstown Rd, Pikesville, MD',lat:39.37081,lng:-76.71992,agency:'Star-K',source:STAR_K_RETAIL,sourceTitle:'Star-K — retail establishments'},
 {name:'Milk and Honey',address:'1777 Reisterstown Rd, Pikesville, MD',lat:39.38662,lng:-76.73433,agency:'Star-K',source:'https://www.gokosher.com/en/f91326',sourceTitle:'GoKosher — Milk and Honey Bistro (Star-K)'},
 {name:'Royal Restaurant',address:'7002-A Reisterstown Rd, Baltimore, MD',lat:39.36202,lng:-76.71191,agency:'Star-K',source:starK('NPKFW0CI'),sourceTitle:'Star-K — Royal Restaurant and Catering certificate'},
 {name:"Dunkin'",aliases:['Dunkin Donuts',"Dunkin' Donuts"],address:'7002-A Reisterstown Rd, Baltimore, MD',lat:39.36227,lng:-76.71118,agency:'Star-D',source:starK('Y319T7XE'),sourceTitle:"Star-K — Dunkin' Fallstaff (Star-D) certificate",note:'Only this Dunkin\' location is certified.'},
 {name:"David Chu's",address:'7105 Reisterstown Rd, Baltimore, MD',lat:39.36355,lng:-76.71173,agency:'Star-K',source:starK('TLFUHUVM'),sourceTitle:"Star-K — David Chu's China Bistro certificate"},
 {name:'Accents Grill',address:'2839 Smith Ave, Baltimore, MD',lat:39.37465,lng:-76.69118,agency:'Star-K',source:STAR_K_RETAIL,sourceTitle:'Star-K — retail establishments'},
 {name:'Serengeti',address:'2839 Smith Ave, Baltimore, MD',lat:39.37448,lng:-76.69109,agency:'Star-K',source:'https://www.star-k.org/articles/category/articles/seasonal/succos/',sourceTitle:'Star-K — Baltimore restaurants with sukkahs'},
 {name:"Sion's Bakery",address:'303 Reisterstown Rd, Pikesville, MD',lat:39.36633,lng:-76.71492,agency:'Star-K',source:'https://www.gokosher.com/en/f91329',sourceTitle:"GoKosher — Sion's Bakery (Star-K)"},
 {name:'Mangal Grill',address:'120 Reisterstown Rd, Pikesville, MD',lat:39.36445,lng:-76.71390,agency:'Star-K',source:'https://www.gokosher.com/en/f91331',sourceTitle:'GoKosher — Mangal Grill Express (Star-K)'},
 {name:"Pariser's Bakery",address:'6711 Reisterstown Rd, Baltimore, MD',lat:39.35877,lng:-76.70543,agency:null,source:'https://www.parisersbakery.com/',sourceTitle:"Pariser's Bakery — Kosher Baltimore"}
];
export const MATCH_METERS=150;
const clean=value=>String(value||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’‘`]/g,"'").replace(/[^a-z0-9]+/g,'');
function meters(a,b){const r=Math.PI/180,h=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;return 12742000*Math.asin(Math.sqrt(h));}
export function kosherListingFor(place,listings=KOSHER_PLACES){
 if(!Number.isFinite(place?.lat)||!Number.isFinite(place?.lng))return null;
 const name=clean(place.name);if(name.length<4)return null;
 return listings.find(entry=>meters(entry,place)<=MATCH_METERS&&[entry.name,...(entry.aliases||[])].map(clean).some(key=>name.includes(key)||key.includes(name)))||null;
}
