import test from 'node:test';
import assert from 'node:assert/strict';
import {initialNameFilters,cleanHiddenNames,hiddenNameMatch,excludedBrandNameMatch} from '../public/name-filters.js';
import {ownershipFor,filterPlaces} from '../public/ownership.js';
const origin={lat:30.2747,lng:-97.7523};
const p=(name,category='other')=>({id:name,name,category,...origin});
test('personal names match complete word sequences with case and punctuation variants',()=>{
 for(const name of ['7-Eleven Fuel','7 Eleven #15','7Eleven Fuel','Downtown 7-Eleven'])assert.equal(hiddenNameMatch(p(name),['7-Eleven']),'7-Eleven',name);
 for(const name of ['Starbucks Coffee Company','STARBUCKS - Downtown'])assert.equal(hiddenNameMatch(p(name),['Starbucks']),'Starbucks');
 assert.equal(hiddenNameMatch(p('Café París'),['cafe paris']),'cafe paris');
 assert.equal(hiddenNameMatch(p('Seashell Gifts'),['Shell']),null);
 assert.equal(hiddenNameMatch(p('CVSish Studios'),['CVS']),null);
 assert.equal(hiddenNameMatch(p('北京 小店'),['北京']),'北京');
});
test('personal names persist as validated user choices and remain independent of ownership exclusions',()=>{
 assert.deepEqual(initialNameFilters(null),{matchBrandNames:true,hiddenNames:[]});
 assert.deepEqual(initialNameFilters({matchBrandNames:false,hiddenNames:[' CVS ','cvs',null,'','---','7-Eleven','7 Eleven']}),{matchBrandNames:false,hiddenNames:['CVS','7-Eleven']});
 assert.deepEqual(cleanHiddenNames(['a'.repeat(81),' valid ']),['valid']);
 const places=[p('Neighborhood Market','grocery'),p('7-Eleven Fuel','gas'),p('Another Market','grocery')];
 assert.deepEqual(filterPlaces(places,{origin,hidden:[],hiddenNames:['Neighborhood Market']}).map(p=>p.name),['7-Eleven Fuel','Another Market']);
});
test('automatic names catch brand departments and locations without asserting ownership',()=>{
 const place=p('7-Eleven Fuel','gas');
 assert.equal(ownershipFor(place).type,'unknown');
 assert.equal(excludedBrandNameMatch(place,['corporate']).brand,'7-Eleven');
 assert.equal(filterPlaces([place],{origin,hidden:['corporate'],matchBrandNames:true}).length,0);
 assert.equal(filterPlaces([place],{origin,hidden:['corporate'],matchBrandNames:false}).length,1);
 assert.equal(filterPlaces([place],{origin,hidden:[],matchBrandNames:true}).length,1);
 assert.equal(ownershipFor(place).type,'unknown');
 assert.equal(excludedBrandNameMatch(p('CVS Photo - Downtown'),['corporate']).parent,'CVS Health Corporation');
 assert.ok(excludedBrandNameMatch(p('Subway - Riverside','restaurant'),['pe']));
 assert.equal(excludedBrandNameMatch(p('Subway - Riverside','restaurant'),['corporate']),null);
});
test('automatic name matches preserve category and punctuation guards and skip independent references',()=>{
 assert.equal(excludedBrandNameMatch(p('Apple Pie Kitchen','restaurant'),['corporate']),null);
 assert.equal(excludedBrandNameMatch(p('ACME - Downtown','restaurant'),['corporate']),null);
 assert.equal(excludedBrandNameMatch(p('ACME - Downtown','grocery'),['corporate']).brand,'ACME');
 assert.equal(excludedBrandNameMatch(p('Seashell Gifts'),['corporate','pe']),null);
 assert.equal(excludedBrandNameMatch(p('What-A-Burger','restaurant'),['corporate','pe']),null);
 assert.equal(excludedBrandNameMatch(p('Whataburger - Airport','restaurant'),['pe']).brand,'Whataburger');
 assert.equal(excludedBrandNameMatch({...p('CVS Photo - London'),lat:51.5,lng:-.1},['corporate']),null);
 assert.equal(excludedBrandNameMatch(p('BookPeople - Downtown'),['corporate','pe']),null);
 assert.equal(excludedBrandNameMatch({...p('Five Guys Plumbing'),brand:'Five Guys Plumbing'},['corporate']),null);
 assert.equal(excludedBrandNameMatch({...p('Downtown shop'),brand:'Five Guys'},['corporate']).brand,'Five Guys');
 for(const hidden of [['corporate'],['pe']])assert.equal(excludedBrandNameMatch(p('Petco Grooming'),hidden).brand,'Petco');
});
test('personal names combine with category, ownership, food and radius filters without deleting places',()=>{
 const places=[{...p('Town Pizza','restaurant'),foodTypes:['pizza']},{...p('Town Pasta','restaurant'),foodTypes:['italian']},p('CVS Photo'),p('7-Eleven Fuel','gas')];
 const before=structuredClone(places);
 assert.deepEqual(filterPlaces(places,{origin,hidden:['corporate','pe'],hiddenNames:['Town Pizza'],matchBrandNames:true}).map(p=>p.name),['Town Pasta']);
 assert.deepEqual(filterPlaces(places,{origin,hiddenNames:['Town Pasta'],foodTypes:['pizza']}).map(p=>p.name),['Town Pizza']);
 assert.deepEqual(places,before);
});
