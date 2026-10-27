import test from 'node:test';
import assert from 'node:assert/strict';
import {BRAND_DIRECTORY} from '../public/brand-directory.js';
import {ownershipFor} from '../public/ownership.js';
import {excludedBrandNameMatch} from '../public/name-filters.js';
const origin={lat:30.2747,lng:-97.7523};
const p=(name,category='other')=>({...origin,name,category});
test('reviewed fuel, coffee, and retail brands participate in automatic name exclusions',()=>{
 for(const [name,category,type,parent] of [
  ['76 - Main Street','gas','corporate','Phillips'],
  ['Valero Fuel Center','gas','corporate','Valero'],
  ['QuickChek - Downtown','grocery','corporate','Murphy'],
  ['Cumberland Farms - Downtown','gas','pe','TDR'],
  ['Kwik Shop - Downtown','gas','pe','TDR'],
  ['Rocket - Main Street','gas','pe','Fortress'],
  ['Scooter’s Coffee - Downtown','coffee','corporate','Scooter'],
  ['Black Rock Coffee Bar - Downtown','coffee','pe','Cynosure'],
  ['Skechers Outlet - Downtown','other','pe','3G'],
  ['LensCrafters - Downtown','other','corporate','Essilor'],
  ['Sephora at Kohl’s - Downtown','other','corporate','LVMH']
 ]){
  const match=excludedBrandNameMatch(p(name,category),[type]);
  assert.ok(match,name);assert.ok(match.parent.includes(parent),name);
  // Longer name exclusions do not create a verified exact ownership match.
  assert.equal(ownershipFor(p(name,category)).type,'unknown',name);
 }
 assert.equal(excludedBrandNameMatch(p('76 Pizza','restaurant'),['corporate']),null);
 assert.equal(excludedBrandNameMatch(p('Pilot Training Center','other'),['corporate']),null);
 assert.equal(excludedBrandNameMatch(p('Rocket Tutoring','other'),['pe']),null);
 assert.equal(ownershipFor(p('PUMA','gas')).type,'unknown');
 assert.equal(excludedBrandNameMatch(p('PUMA - Downtown','gas'),['corporate']),null);
});
test('current public equity and completed private ownership remain distinct',()=>{
 const row=name=>BRAND_DIRECTORY.find(b=>b.brand===name);
 assert.equal(row('Skechers').type,'pe');assert.equal(row('Skechers').publicListing,undefined);
 assert.deepEqual(row('Shoe Carnival').publicListing.exchanges,[{exchange:'Nasdaq',ticker:'SHOE'}]);
 assert.deepEqual(row('Sunoco').publicListing.exchanges,[{exchange:'TXSE',ticker:'SUN'}]);
 assert.deepEqual(row('Dillard’s').publicListing.exchanges,[{exchange:'TXSE',ticker:'DDS'}]);
 assert.equal(row('Cumberland Farms').publicListing,undefined);
 assert.deepEqual(row('Black Rock Coffee Bar').categories,['corporate','pe']);
 assert.equal(row('Cenex').publicListing,undefined);assert.equal(row('Cenex').type,'independent');
 assert.match(row('Cenex').note,/preferred stock/);assert.equal(row('Cenex Zip Trip').type,'corporate');
 assert.equal(row('CITGO').type,'corporate');assert.ok(!row('CITGO').sponsors?.includes('Elliott Investment Management'));
 assert.equal(row('Pet Supplies Plus').type,'corporate');assert.equal(row('Pet Supplies Plus').sponsors,undefined);
});
test('October 27 restaurant and retail additions carry their reviewed owners and name guards',()=>{
 const at={lat:39.29,lng:-76.61},q=(name,category)=>({...at,name,category});
 for(const [name,category,type,parent] of [
  ["Denny's",'restaurant','pe','TriArtisan'],['Qdoba Mexican Eats','restaurant','pe','Butterfly'],["Rally's #123",'restaurant','pe','Oak Hill'],
  ['Del Taco','restaurant','corporate','Yadav'],['Krispy Kreme','coffee','corporate','Krispy Kreme'],['Office Depot','other','pe','Atlas'],
  ['Nordstrom Rack','apparel','corporate','Liverpool'],['Zales','apparel','corporate','Signet'],['The Vitamin Shoppe','pharmacy','pe','Kingswood'],
  ['Royal Farms','gas','corporate','Two Farms'],['GetGo','gas','corporate','Couche-Tard'],['Pep Boys','other','pe','Mavis']
 ]){const owner=ownershipFor(q(name,category));assert.equal(owner.type,type,name);assert.ok(owner.parent.includes(parent),name);}
 for(const [name,category] of [['Checkers','grocery'],['Bob Evans','grocery'],['Hollister Hardware','home'],['Jared','restaurant'],['Kirkland Signature','general'],['Hollister','restaurant']])assert.equal(ownershipFor(q(name,category)).type,'unknown',name);
 assert.equal(ownershipFor({lat:34.05,lng:-118.24,name:'GetGo',category:'gas'}).type,'unknown');
 assert.match(ownershipFor(q("BJ's Restaurant & Brewhouse",'restaurant')).parent,/BJ's Restaurants/);
 assert.match(ownershipFor(q("BJ's Wholesale Club",'general')).parent,/Wholesale Club/);
 assert.equal(excludedBrandNameMatch(q("Denny's - Downtown",'restaurant'),['pe']).brand,"Denny's");
 assert.equal(excludedBrandNameMatch(q('Hollister Plumbing Supply','home'),['corporate']),null);
});
test('national chains with unconfirmed owners are corporate without inferred sponsors',()=>{
 const at={lat:39.29,lng:-76.61},q=(name,category)=>({...at,name,category});
 for(const [name,category] of [['TGI Fridays','restaurant'],['Blaze Pizza','restaurant'],['Chuck E. Cheese','restaurant'],["Torchy's Tacos",'restaurant'],['Sbarro','restaurant'],['Cicis','restaurant'],['Smoothie King','coffee'],['Fleet Farm','general'],["Carter's",'apparel'],["OshKosh B'gosh",'apparel']]){
  const owner=ownershipFor(q(name,category));assert.equal(owner.type,'corporate',name);assert.equal(owner.sponsors,undefined,name);
 }
 for(const [name,category] of [["Carter's",'restaurant'],['OshKosh','restaurant'],["Torchy's",'grocery'],['TGIF','grocery']])assert.equal(ownershipFor(q(name,category)).type,'unknown',name);
 assert.deepEqual(ownershipFor(q("Carter's",'apparel')).publicListing.exchanges,[{exchange:'NYSE',ticker:'CRI'}]);
});
test('store-category additions keep short brand names inside their store category',()=>{
 const at={lat:39.29,lng:-76.61},q=(name,category)=>({...at,name,category});
 for(const [name,category,type,parent] of [['H&M','apparel','corporate','Hennes'],['Express','apparel','corporate','WHP'],['RH','home','corporate','RH'],['Belk','general','pe','KKR'],["Gabe's",'general','pe','Brigade'],['PacSun','apparel','pe','Golden Gate'],['Coach Outlet','apparel','corporate','Tapestry'],['Eyeglass World','pharmacy','corporate','National Vision'],['Total Wine','other','corporate','Trone']]){
  const owner=ownershipFor(q(name,category));assert.equal(owner.type,type,name);assert.ok(owner.parent.includes(parent),name);
 }
 for(const [name,category] of [['H M Plumbing','home'],['HM Supply','apparel'],['Express','grocery'],['RH','other'],['Columbia','apparel'],['Ashley','home'],['Vans','other'],['Pandora','restaurant'],['Saks OFF 5TH','apparel']])assert.equal(ownershipFor(q(name,category)).type,'unknown',name);
 assert.equal(excludedBrandNameMatch(q('Express Lube','other'),['corporate']),null);
});
