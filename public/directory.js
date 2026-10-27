import {ownershipCategories,localOperatorNote,localOperatorLabel,isListedBrand} from './ownership-categories.js?v=20261027-banks2';
import {BRAND_DIRECTORY} from './brand-directory.js?v=20261027-banks2';
import {TYPE_LABELS,searchBrands} from './directory-utils.js';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const listed=BRAND_DIRECTORY.filter(isListedBrand);
$('#brand-total').textContent=listed.length;
for(const type of ['corporate','pe'])$('#'+type+'-total').textContent=listed.filter(brand=>ownershipCategories(brand).includes(type)).length;
function render(){
 const matches=searchBrands(listed,{query:$('#brand-search').value,type:$('#brand-type').value});
 $('#brand-result-count').textContent=matches.length+' of '+listed.length+' brands';
 $('#brand-results').innerHTML=matches.length?matches.map(brand=>`<article class="brand-card"><div class="brand-card-heading"><h2>${escape(brand.brand)}</h2><span class="brand-badges">${ownershipCategories(brand).map(type=>`<span class="badge ${type}">${TYPE_LABELS[type]}</span>`).join('')}${localOperatorLabel(brand)?`<span class="badge local">${escape(localOperatorLabel(brand))}</span>`:''}</span></div><p class="brand-parent">${escape(brand.parent)}</p>${brand.publicListing?`<p class="stock-listing">Publicly traded · ${brand.publicListing.exchanges.map(listing=>escape(listing.exchange)+': '+escape(listing.ticker)).join(' · ')}<br><span>${escape(brand.publicListing.company)}</span></p>`:''}<p class="brand-note">${escape(brand.note)}</p>${brand.headquarters?`<p class="local-operators">Privately held · headquartered in ${escape(brand.headquarters.city)}, ${escape(brand.headquarters.state)}</p>`:''}${localOperatorNote(brand)?`<p class="local-operators">${escape(localOperatorNote(brand))}</p>`:''}<div class="brand-card-footer"><a href="${escape(brand.source)}" target="_blank" rel="noreferrer">${escape(brand.sourceTitle)} ↗</a>${brand.publicListing?`<a class="listing-reference" href="${escape(brand.publicListing.source)}" target="_blank" rel="noreferrer">Stock listing source ↗</a><span>Listing checked ${escape(brand.publicListing.checked)}</span>`:''}${brand.wikipedia?`<a class="wikipedia-reference" href="${escape(brand.wikipedia)}" target="_blank" rel="noreferrer">Wikipedia ↗</a>`:''}${(brand.discoverySources||[]).map(reference=>`<a class="discovery-reference" href="${escape(reference.url)}" target="_blank" rel="noreferrer">${escape(reference.title)} ↗</a>`).join('')}<time datetime="${brand.checked}">Reviewed ${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(brand.checked+'T12:00:00Z'))}</time></div></article>`).join(''):'<div class="directory-empty"><h2>No matching brands yet.</h2><p>Try another name or parent company. A missing entry does not mean a business is independent.</p></div>';
}
$('#brand-search').oninput=render;
$('#brand-type').onchange=render;
$('#brand-search-form').onsubmit=event=>event.preventDefault();
$('#brand-search-form').onreset=()=>setTimeout(render,0);
render();
