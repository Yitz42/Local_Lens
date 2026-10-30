// Facility-level ownership for hospitals, from the PE Hospital Tracker (see scripts/build-hospitals.mjs).
// A map place matches a tracked hospital by normalized name and city. Without a city, the name alone counts
// only when no other tracked hospital in the country shares it.
const WORDS={st:'saint',ste:'sainte',mt:'mount',ft:'fort',ctr:'center',cntr:'center',centre:'center',med:'medical',hosp:'hospital',reg:'regional',rgnl:'regional',rehab:'rehabilitation',hlth:'health',sys:'system',univ:'university',mem:'memorial',comm:'community',and:''};
const DROP=new Set(['the','inc','llc','lp','llp','corp','corporation','dba','campus','of','at']);
export function hospitalKey(value=''){
 return String(value).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/['’`]/g,'').split(/[^a-z0-9]+/).map(word=>WORDS[word]??word).filter(word=>word&&!DROP.has(word)).join(' ');
}
export function cityKey(value=''){return hospitalKey(value).replace(/\bnational park$/,'').trim();}
// Within the same city, a name that starts or ends the tracked name also counts ("Southern Hills Medical Center"
// for "TriStar Southern Hills Medical Center") when the shorter name has at least three words and only one
// tracked hospital fits.
function partOf(a,b){const [short,long]=a.length<=b.length?[a,b]:[b,a];return short.split(' ').length>=3&&(long.startsWith(short+' ')||long.endsWith(' '+short));}
function pick(key,rows){const exact=rows.filter(row=>row[0]===key);if(exact.length)return exact[0];const partial=rows.filter(row=>partOf(key,row[0]));return partial.length===1?partial[0]:null;}
export function findHospital(place,hospitals){
 const key=hospitalKey(place?.name);if(!key||key.split(' ').length<2)return null;
 const city=cityKey(place.addressCity);
 if(city)return pick(key,hospitals.filter(row=>row[1]===city||row[1].startsWith(city+' ')||city.startsWith(row[1]+' ')));
 // Google listings carry the city only inside the formatted address ("…, Hot Springs, AR 71901, USA").
 const address=String(place.address||'');
 if(/,/.test(address)){const addressWords=' '+hospitalKey(address)+' ';return pick(key,hospitals.filter(row=>addressWords.includes(' '+row[1]+' ')&&new RegExp(`,\\s*${row[2]}\\s+\\d{5}`).test(address)));}
 const candidates=hospitals.filter(row=>row[0]===key);
 return candidates.length===1&&candidates[0][9]?candidates[0]:null;
}
