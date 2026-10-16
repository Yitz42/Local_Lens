import {BRAND_DIRECTORY} from './brand-directory.js?v=20261016-wikipedia1';
import {TYPE_LABELS,searchBrands} from './directory-utils.js';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const listed=BRAND_DIRECTORY.filter(brand=>brand.type!=='independent');
$('#brand-total').textContent=listed.length;
for(const type of ['corporate','pe'])$('#'+type+'-total').textContent=listed.filter(brand=>brand.type===type).length;
function render(){
 const matches=searchBrands(listed,{query:$('#brand-search').value,type:$('#brand-type').value});
 $('#brand-result-count').textContent=matches.length+' of '+listed.length+' brands';
 $('#brand-results').innerHTML=matches.length?matches.map(brand=>`<article class="brand-card"><div class="brand-card-heading"><h2>${escape(brand.brand)}</h2><span class="badge ${brand.type}">${TYPE_LABELS[brand.type]}</span></div><p class="brand-parent">${escape(brand.parent)}</p><p class="brand-note">${escape(brand.note)}</p><div class="brand-card-footer"><a href="${escape(brand.source)}" target="_blank" rel="noreferrer">${escape(brand.sourceTitle)} ↗</a>${brand.wikipedia?`<a class="wikipedia-reference" href="${escape(brand.wikipedia)}" target="_blank" rel="noreferrer">Wikipedia ↗</a>`:''}<time datetime="${brand.checked}">Reviewed ${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(brand.checked+'T12:00:00Z'))}</time></div></article>`).join(''):'<div class="directory-empty"><h2>No matching brands yet.</h2><p>Try another name or parent company. A missing entry does not mean a business is independent.</p></div>';
}
$('#brand-search').oninput=render;
$('#brand-type').onchange=render;
$('#brand-search-form').onsubmit=event=>event.preventDefault();
$('#brand-search-form').onreset=()=>setTimeout(render,0);
render();
