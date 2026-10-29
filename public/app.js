import {allBrandsFilterState,setAllBrandsHidden,localOperatorNote,localOperatorLabel,LOCAL_LEVELS,DEFAULT_LOCAL_LEVEL,cleanLocalLevel} from './ownership-categories.js?v=20261029-radius2';
import {FOOD_TYPES,OWNERSHIP_PREFERENCE_KEY,initialOwnershipFilters,foodTypeLabel,foodTypesForPlace,isDietType,DIET_CATEGORIES} from './food-types.js?v=20261029-radius2';
function ownershipBadges(ownership,place){const local=localOperatorLabel(ownership),hq=place&&isLocalCorporation(place,ownership)?ownership.headquarters:null;return '<span class="ownership-badges">'+ownershipCategories(ownership).map(type=>`<span class="badge ${type}">${LABELS[type]}</span>`).join('')+(local?`<span class="badge local" title="${escape(localOperatorNote(ownership))}">${escape(local)}</span>`:'')+(hq?`<span class="badge local" title="Headquartered in ${escape(hq.city)}, ${escape(hq.state)}">Local HQ · ${escape(hq.city)}</span>`:'')+'</span>';}
import {CHECKED,ownershipCategories,LABELS,CATEGORIES,fromOSM,filterPlaces,ownershipFor,distance,headquartersDistanceMiles,isLocalCorporation} from './ownership.js?v=20261029-radius2';
import {collectPlacePages} from './places-loader.js?v=20261029-radius2';
import {kosherListingFor} from './kosher-places.js?v=20261029-radius2';
import {PLACE_CACHE_FORMAT,areaKey,findNearbyCache,storeNearbyCache} from './place-cache.js?v=20261029-radius2';
import {GOOGLE_SAVED_STORAGE,googleKey,savedGoogleIds,createGoogleMap,searchGooglePlaces,resolveGoogleSaved} from './google-places.js?v=20261029-radius2';
import {STORE_TYPES,storeTypeName} from './store-types.js?v=20261029-radius2';
import {NAME_FILTERS_KEY,MAX_HIDDEN_NAMES,MAX_NAME_LENGTH,cleanHiddenNames,initialNameFilters} from './name-filters.js?v=20261029-radius2';
const $=s=>document.querySelector(s);
const reviewedDate=value=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name,cls='')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const connectionKey=googleKey();
const googleIds=savedGoogleIds(read(GOOGLE_SAVED_STORAGE,[]));
const rawSaved=read('local-lens-saved',[]);
const initialSaved=Array.isArray(rawSaved)?rawSaved.filter(p=>!p?.id?.startsWith('google/')&&typeof p?.id==='string'&&typeof p.name==='string'&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)):[];
const rawHidden=read(OWNERSHIP_PREFERENCE_KEY,null);
const namePreferences=initialNameFilters(read(NAME_FILTERS_KEY,null));
const LOCAL_LEVEL_KEY='local-lens-local-level-v3';
// Earlier versions lacked later-added steps; map saved choices to the same meaning.
const storedLocalLevel=(()=>{const current=read(LOCAL_LEVEL_KEY,null);if(current!==null)return cleanLocalLevel(current);const v2=read('local-lens-local-level-v2',null);if(Number.isInteger(v2)&&v2>=0&&v2<=3)return [0,1,3,4][v2];const v1=read('local-lens-local-level-v1',null);return Number.isInteger(v1)&&v1>=0&&v1<=2?[1,3,4][v1]:DEFAULT_LOCAL_LEVEL;})();
const state={origin:{lat:30.2747,lng:-97.7523},area:'Austin, Texas',example:true,radius:3219,category:'all',storeType:'all',foodTypes:[],...namePreferences,hidden:initialOwnershipFilters(rawHidden),localLevel:storedLocalLevel,places:[],saved:initialSaved,googleIds,googleMode:!!connectionKey,savedBusy:false,savedLoaded:false,savedUnavailable:[],mode:'explore',sort:'distance',busy:false,limit:60,selected:null,loadedAt:null,cached:false,loadError:false,loadedKey:null,cacheLabel:null};
let googleProvider,googleSearchTimer;
let map,markerLayer,centerMarker,suppressMapSearch=false,toastTimer,requestId=0,fetchController,lastSearchAt=0;
let filtered=[];
function toast(message,ms=5500){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,ms);}
const MY_KOSHER_KEY='local-lens-my-kosher-v1',OVERPASS_URL='https://overpass-api.de/api/interpreter';
state.myKosher=new Set(read(MY_KOSHER_KEY,[]).filter(id=>typeof id==='string').slice(0,500));
state.osmKosher={key:null,places:[]};
// OpenStreetMap volunteers tag many kosher places that other sources miss; look them up only while Kosher is selected.
function refreshOsmKosher(){
 if(state.mode!=='explore'||!state.foodTypes.includes('kosher'))return;
 const key=areaKey(state.origin,state.radius);if(state.osmKosher.key===key)return;
 state.osmKosher={key,places:[]};
 const around=`around:${state.radius},${state.origin.lat.toFixed(5)},${state.origin.lng.toFixed(5)}`;
 const query=`[out:json][timeout:20];(nwr(${around})["diet:kosher"~"^(yes|only)$"];nwr(${around})["cuisine"~"(^|;)kosher(;|$)"];);out center tags 300;`;
 fetchJSON(OVERPASS_URL,{method:'POST',body:new URLSearchParams({data:query})},25000).then(data=>{
  if(state.osmKosher.key!==key)return;
  state.osmKosher={key,places:fromOSM(data.elements||[]).map(place=>({...place,source:'OpenStreetMap',foodTypes:[...new Set([...place.foodTypes,'kosher'])]}))};
  render();
 }).catch(()=>{});
}
// Adds personal and OpenStreetMap kosher marks, plus OpenStreetMap kosher places missing from the loaded results.
function withKosherSources(list,includeExtras=false){
 const refs=state.osmKosher.places;
 const marked=list.map(place=>{const mine=state.myKosher.has(place.id),osm=refs.length>0&&!!kosherListingFor(place,refs);return mine||osm?{...place,myKosher:mine,osmKosher:osm}:place;});
 if(!includeExtras||!refs.length||!state.foodTypes.includes('kosher'))return marked;
 return [...marked,...refs.filter(ref=>!list.some(place=>kosherListingFor(place,[ref]))).map(place=>({...place,myKosher:state.myKosher.has(place.id),osmKosher:true}))];
}
function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{toast('Your browser could not save this choice. It will last for this visit.');}}
function category(p){return CATEGORIES.find(c=>c.id===p.category)||CATEGORIES.find(c=>c.id==='other');}
function miles(m){return m<160?'Nearby':(m/1609.344).toFixed(1)+' mi';}
function isSaved(id){return id.startsWith('google/')?state.googleIds.includes(id.slice(7)):state.saved.some(p=>p.id===id);}
function updateSavedCount(){const count=state.saved.filter(p=>!p.id.startsWith('google/')).length+state.googleIds.length;$('#saved-count').textContent=count;$('#saved-count').hidden=!count;}
function toggleSaved(id){
 const p=[...state.places,...state.saved].find(x=>x.id===id);if(!p)return;
 const was=isSaved(id);state.saved=was?state.saved.filter(x=>x.id!==id):[...state.saved,p];
 if(id.startsWith('google/')){state.googleIds=was?state.googleIds.filter(value=>value!==id.slice(7)):[...new Set([...state.googleIds,id.slice(7)])];persist(GOOGLE_SAVED_STORAGE,state.googleIds);}
 else persist('local-lens-saved',state.saved.filter(value=>!value.id.startsWith('google/')));
 updateSavedCount();render();if($('#detail-dialog').open)showDetails(id,false,p);toast(was?'Place removed from your saved list.':'Place saved. Find it in your Saved list.',2500);
}
function refreshGoogleSearch(){if(!state.googleMode||state.mode!=='explore')return;clearTimeout(googleSearchTimer);googleSearchTimer=setTimeout(()=>loadPlaces(),300);}

function initMap(){if(!window.L){$('#map').innerHTML='<div class="map-failure">The map could not load. You can still browse and filter places in the list.</div>';return;}map=L.map('map',{zoomControl:false,scrollWheelZoom:true,minZoom:3}).setView([state.origin.lat,state.origin.lng],14);L.control.zoom({position:'bottomright'}).addTo(map);const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);let errors=0;tiles.on('tileerror',()=>{if(++errors===8)toast('Map tiles are unavailable. The place list and filters still work.');});markerLayer=(L.markerClusterGroup?L.markerClusterGroup({maxClusterRadius:42,showCoverageOnHover:false,spiderfyOnMaxZoom:true,iconCreateFunction:cluster=>L.divIcon({html:'<span>'+cluster.getChildCount()+'</span>',className:'place-cluster',iconSize:[38,38]})}):L.layerGroup()).addTo(map);map.on('moveend',()=>{if(!suppressMapSearch&&state.mode==='explore')$('#search-map').hidden=false;});drawCenter();}
function drawCenter(){if(!map)return;if(googleProvider){googleProvider.drawCenter(state.origin);return;}if(centerMarker)map.removeLayer(centerMarker);centerMarker=L.marker([state.origin.lat,state.origin.lng],{interactive:false,zIndexOffset:1000,icon:L.divIcon({className:'',html:'<div class="center-marker"></div>',iconSize:[15,15],iconAnchor:[7,7]})}).addTo(map);}
function focusMap(lat=state.origin.lat,lng=state.origin.lng,zoom=state.radius>10000?11:state.radius>3500?12:state.radius<1000?16:state.radius<2000?15:14){if(!map)return;suppressMapSearch=true;map.setView([lat,lng],zoom,{animate:false});suppressMapSearch=false;$('#search-map').hidden=true;}
function renderMarkers(){if(!map)return;if(googleProvider){googleProvider.renderMarkers(filtered);return;}markerLayer.clearLayers();for(const p of filtered){const c=category(p);L.marker([p.lat,p.lng],{title:p.name,keyboard:true,icon:L.divIcon({className:'',html:`<div class="map-marker ${p.ownership.type}"><div class="marker-body">${icon(c.icon)}</div></div>`,iconSize:[33,39],iconAnchor:[16,35]})}).bindTooltip(escape(p.name),{direction:'top',offset:[0,-32]}).on('click',()=>showDetails(p.id)).addTo(markerLayer);}}
function filterOptions(savedMode,localLevel=state.localLevel){return {category:state.category,storeType:state.storeType,hidden:state.hidden,foodTypes:state.foodTypes,hiddenNames:state.hiddenNames,matchBrandNames:state.matchBrandNames,localLevel,origin:state.origin,sort:state.sort,radius:savedMode?Infinity:state.radius};}
const localLevelActive=()=>state.hidden.includes('corporate')||state.hidden.includes('pe');
// Shows what each slider step would add in the current area; only computed while the panel is open.
function syncLocalLevel(){
 const active=localLevelActive(),level=LOCAL_LEVELS[state.localLevel];
 $('#local-level').value=state.localLevel;$('#local-level').disabled=!active;$('#local-level-group').classList.toggle('disabled',!active);
 if(!active){$('#local-level-value').textContent='Applies when corporate or private equity brands are hidden.';return;}
 let text=level.label+'. '+level.detail;
 if(!$('#filter-panel').hidden&&state.mode==='explore'&&state.places.length){
  const savedMode=false,counts=LOCAL_LEVELS.map((_,index)=>filterPlaces(state.places,filterOptions(savedMode,index)).length),next=counts.slice(1).map((count,index)=>count-counts[index]);
  text+=` In this area: ${next[0]?`−${next[0]} co-op stores at Independent only, `:''}+${next[1]} regional & local corporations, +${next[2]} more with local franchise owners, +${next[3]} more with dealers.`;
 }
 $('#local-level-value').textContent=text;
}
function render(){const savedMode=state.mode==='saved';refreshOsmKosher();const places=withKosherSources(savedMode?state.saved:state.places,!savedMode);filtered=filterPlaces(places,filterOptions(savedMode));$('#results-eyebrow').textContent=savedMode?'YOUR OWN LITTLE DIRECTORY':state.area.toUpperCase()+(state.example?' · EXAMPLE AREA':'');$('#results-title').textContent=savedMode?'Your saved places.':'A place for your everyday.';$('#map-area').innerHTML=icon('pin')+escape(state.area);$('#result-count').textContent=!savedMode&&state.busy?'Finding places…':!savedMode&&state.loadError&&!state.places.length?'Places unavailable':`${filtered.length} ${filtered.length===1?'place':'places'}${state.hidden.length||state.foodTypes.length||state.hiddenNames.length?' after filters':''}`;$('#explore-tab').classList.toggle('active',!savedMode);$('#saved-tab').classList.toggle('active',savedMode);$('#radius-select').disabled=savedMode;$('#filter-count').textContent=state.hidden.length;$('#filter-count').hidden=!state.hidden.length;for(const type of ['pe','corporate','unknown'])$('#hide-'+type).checked=state.hidden.includes(type);const chainState=allBrandsFilterState(state.hidden);$('#hide-chains').checked=chainState.checked;$('#hide-chains').indeterminate=chainState.indeterminate;syncLocalLevel();$('#active-filters').hidden=!(state.hidden.length||state.foodTypes.length||state.hiddenNames.length);const localChip=state.localLevel!==DEFAULT_LOCAL_LEVEL&&localLevelActive()?`<button class="active-filter local-chip" data-unlocal="1">${escape(LOCAL_LEVELS[state.localLevel].label)} ${icon('close')}</button>`:'';const names={pe:'Private equity',corporate:'Corporate brands',unknown:'Unknown ownership'};$('#active-filters').innerHTML=localChip+state.hidden.map(t=>`<button class="active-filter" data-unhide="${t}">Hiding ${names[t]} ${icon('close')}</button>`).join('')+state.foodTypes.map(id=>`<button class="active-filter food-chip" data-unfood="${id}">${escape(FOOD_TYPES.find(type=>type.id===id).name)} ${icon('close')}</button>`).join('');$('#active-filters').insertAdjacentHTML('beforeend',state.hiddenNames.map((name,index)=>`<button class="active-filter name-chip" data-unname="${index}">Hiding name: ${escape(name)} ${icon('close')}</button>`).join(''));$('#active-filters').querySelectorAll('[data-unname]').forEach(button=>button.onclick=()=>removeHiddenName(Number(button.dataset.unname)));$('#active-filters').querySelectorAll('[data-unlocal]').forEach(b=>b.onclick=()=>setLocalLevel(DEFAULT_LOCAL_LEVEL));$('#active-filters').querySelectorAll('[data-unhide]').forEach(b=>b.onclick=()=>{state.hidden=state.hidden.filter(t=>t!==b.dataset.unhide);persist(OWNERSHIP_PREFERENCE_KEY,state.hidden);render();});
$('#active-filters').querySelectorAll('[data-unfood]').forEach(button=>button.onclick=()=>{state.foodTypes=state.foodTypes.filter(id=>id!==button.dataset.unfood);state.limit=60;render();refreshGoogleSearch();});syncFoodFilters();syncNameFilters();
const status=$('#place-status');status.hidden=savedMode?!state.savedBusy&&!(state.googleIds.length&&!state.googleMode):!(state.busy&&state.places.length||state.loadError&&state.places.length);
status.innerHTML=savedMode?(state.savedBusy?'Refreshing saved Google places…':'Connect Google Maps to refresh your saved Google bookmarks. <a href="connection.html">Connect</a>'):state.busy?'<span class="spinner"></span><span>Updating nearby places…</span>':'<span>Showing saved results. Live updates are temporarily unavailable.</span><button id="refresh-places">Retry</button>';
if($('#refresh-places'))$('#refresh-places').onclick=()=>loadPlaces();
if(savedMode&&state.savedBusy){$('#result-list').innerHTML='<div class="loading-state"><span class="spinner"></span>Refreshing saved Google places…</div>';$('#list-footer').textContent='Fetching current listings for your saved place IDs.';}
else if(!savedMode&&state.loadError&&!state.places.length){$('#result-list').innerHTML=`<div class="empty-state">${icon('info')}<h3>Places are temporarily unavailable.</h3><p>${state.googleMode?'Google could not retrieve businesses for this area. Check the API key, enabled APIs, billing, and website restrictions in your Google project.':'We couldn’t retrieve places for this area. This doesn’t mean there are no matching businesses. Try again or search another area.'}</p>${state.googleMode?'<a href="connection.html">Google Maps connection settings</a>':''}<button id="retry-places">Try again</button></div>`;$('#retry-places').onclick=()=>loadPlaces();$('#list-footer').textContent='Your filters and saved places are still available.';}
else if(state.busy&&!savedMode&&!state.places.length){$('#result-list').innerHTML='<div class="loading-state"><span class="spinner"></span><span id="loading-message">Looking around the neighborhood…</span></div>';$('#list-footer').textContent='Loading published place data.';}else if(!filtered.length){const hasFood=state.foodTypes.length>0;const title=hasFood?'No matching food types here.':savedMode&&!state.saved.length?'Keep your favorites close.':state.hidden.length||state.hiddenNames.length?'A little too filtered?':'No places found here yet.';const copy=hasFood?'Try another food type or a wider area. Some places have no food-type data.':savedMode&&!state.saved.length?'Tap the bookmark on any place to keep it here.':state.hiddenNames.length?'Try editing your hidden names or widening the area.':state.hidden.length?'Try showing more ownership types or another category.':'Try a wider radius or search a nearby area. Place-data coverage varies.';$('#result-list').innerHTML=`<div class="empty-state">${icon(savedMode?'bookmark':'search')}<h3>${title}</h3><p>${copy}</p><button id="empty-action">${hasFood?'Clear food types':savedMode&&!state.saved.length?'Explore places':state.hiddenNames.length?'Edit name filters':state.hidden.length?'Show all ownership':'Search again'}</button></div>`;$('#empty-action').onclick=()=>{if(hasFood){state.foodTypes=[];state.limit=60;render();refreshGoogleSearch();}else if(savedMode&&!state.saved.length)setMode('explore');else if(state.hiddenNames.length){$('#name-filters').open=true;$('#hidden-name-input').focus();}else if(state.hidden.length){state.hidden=[];persist(OWNERSHIP_PREFERENCE_KEY,[]);render();}else loadPlaces();};$('#list-footer').textContent='Unknown ownership is never treated as independent.';}else{const visible=filtered.slice(0,state.limit);$('#result-list').innerHTML=visible.map(p=>{const c=category(p);const detail=foodTypeLabel(p)||(p.category==='other'&&p.storeType&&p.storeType!=='other'?storeTypeName(p.storeType):c.name);return `<article class="place-card ${state.selected===p.id?'selected':''}" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${escape(p.name)} ownership and details"><div class="place-top"><div class="category-icon">${icon(c.icon)}</div><div class="place-title"><h3>${escape(p.name)}</h3><p>${escape(detail)}<span>·</span>${miles(p.distance)}</p></div><button class="save-place ${isSaved(p.id)?'is-saved':''}" data-save="${p.id}" aria-label="${isSaved(p.id)?'Unsave':'Save'} ${escape(p.name)}" aria-pressed="${isSaved(p.id)}">${icon('bookmark')}</button></div><div class="place-bottom">${ownershipBadges(p.ownership,p)}<span class="ownership-link">Ownership details ${icon('arrow')}</span></div></article>`;}).join('')+(filtered.length>state.limit?'<button id="load-more" class="load-more">Show more places</button>':'');$('#result-list').querySelectorAll('.place-card').forEach(el=>{el.onclick=()=>showDetails(el.dataset.id);el.onkeydown=e=>{if(e.target===el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showDetails(el.dataset.id);}};});$('#result-list').querySelectorAll('[data-save]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleSaved(b.dataset.save);});if($('#load-more'))$('#load-more').onclick=()=>{const scroll=$('#result-list').scrollTop;state.limit+=60;render();$('#result-list').scrollTop=scroll;};$('#list-footer').textContent=savedMode?`Saved on this browser. Ownership directory last updated ${reviewedDate(CHECKED)}.`:`${state.googleMode?'Google Maps · selected nearby results':state.cacheLabel||(state.cached?'Saved nearby results':'Overture Maps')}${state.loadedAt?' · '+new Date(state.loadedAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):''} · ${filtered.filter(p=>p.ownership.type!=='unknown').length} ownership matches. Distances are approximate.`;}
if(savedMode&&state.savedUnavailable.length){
 $('#result-list').insertAdjacentHTML('beforeend','<div class="unavailable-saved"><p>Some saved Google places could not be refreshed. They may be closed or unavailable.</p>'+state.savedUnavailable.map(id=>`<p><a href="https://www.google.com/maps/search/?api=1&query=place&query_place_id=${encodeURIComponent(id)}" target="_blank" rel="noreferrer">View saved place on Google Maps ↗</a> <button class="text-button" data-remove-google="${escape(id)}">Remove bookmark</button></p>`).join('')+'</div>');
 $('#result-list').querySelectorAll('[data-remove-google]').forEach(button=>button.onclick=()=>{const id=button.dataset.removeGoogle;state.googleIds=state.googleIds.filter(value=>value!==id);state.savedUnavailable=state.savedUnavailable.filter(value=>value!==id);persist(GOOGLE_SAVED_STORAGE,state.googleIds);render();});
}
const attributionList=$('#provider-attributions');
if(attributionList){const sources=new Map();for(const p of places)for(const a of p.attributions||[])sources.set(a.provider+' '+a.providerURI,a);attributionList.hidden=!sources.size;attributionList.innerHTML=[...sources.values()].map(a=>safeWebsite(a.providerURI)?`<a href="${escape(safeWebsite(a.providerURI))}" target="_blank" rel="noreferrer">${escape(a.provider)}</a>`:escape(a.provider)).join(' · ');}
renderMarkers();updateSavedCount();}
function syncStoreType(){$('#store-type-wrap').hidden=state.category!=='other';$('#store-type').value=state.storeType;}
$('#store-type').innerHTML='<option value="all">All store types</option>'+STORE_TYPES.map(type=>`<option value="${type.id}">${escape(type.name)}</option>`).join('')+'<option value="other">Everything else</option>';
$('#store-type').onchange=event=>{state.storeType=event.target.value;state.limit=60;render();$('#result-list').scrollTop=0;};
function categoryOptions(){const groups=[...new Set(CATEGORIES.map(c=>c.group).filter(Boolean))];const option=c=>`<option value="${c.id}">${escape(c.name)}</option>`;return CATEGORIES.filter(c=>!c.group).map(option).join('')+groups.map(group=>`<optgroup label="${escape(group)}">${CATEGORIES.filter(c=>c.group===group).map(option).join('')}</optgroup>`).join('');}
$('#category').innerHTML=categoryOptions();
$('#category').onchange=event=>{state.category=event.target.value;state.storeType='all';state.foodTypes=foodTypesForCategory(state.foodTypes,state.category);state.limit=60;renderCategories();render();refreshGoogleSearch();$('#result-list').scrollTop=0;};
function renderCategories(){syncStoreType();const current=CATEGORIES.find(c=>c.id===state.category)||CATEGORIES[0];$('#category').value=current.id;$('#category-icon').innerHTML=icon(current.icon);$('#category').closest('.category-picker').classList.toggle('active',current.id!=='all');}
// Cuisines apply to restaurants; dietary types also apply to cafés, groceries, and bars.
const foodCategories=id=>isDietType(id)?['all',...DIET_CATEGORIES]:['all','restaurant'];
function foodTypesForCategory(ids,category){return ids.filter(id=>foodCategories(id).includes(category));}
function foodOption(type){return `<label class="food-option"><input type="checkbox" value="${type.id}" data-food="${type.id}"><span>${escape(type.name)}</span></label>`;}
function renderFoodFilters(){$('#food-options').innerHTML=`<p class="food-group">Dietary</p>${FOOD_TYPES.filter(type=>type.diet).map(foodOption).join('')}<p class="food-group">Cuisine</p>${FOOD_TYPES.filter(type=>!type.diet).map(foodOption).join('')}`;$('#food-options').querySelectorAll('input').forEach(input=>input.onchange=()=>{state.foodTypes=input.checked?[...new Set([...state.foodTypes,input.value])]:state.foodTypes.filter(id=>id!==input.value);if(input.checked&&!foodCategories(input.value).includes(state.category))state.category='all';state.limit=60;renderCategories();render();refreshGoogleSearch();$('#result-list').scrollTop=0;});}
function syncFoodFilters(){$('#food-count').textContent=state.foodTypes.length?state.foodTypes.length+' selected':'Any';$('#food-options').querySelectorAll('input').forEach(input=>input.checked=state.foodTypes.includes(input.value));}
function saveNameFilters(){persist(NAME_FILTERS_KEY,{matchBrandNames:state.matchBrandNames,hiddenNames:state.hiddenNames});state.limit=60;render();}
function removeHiddenName(index){state.hiddenNames=state.hiddenNames.filter((_,i)=>i!==index);saveNameFilters();}
function positionNamePanel(){
 const panel=$('#name-filters .name-panel');panel.style.top='';
 if($('#name-filters').open&&innerWidth<=640){const controls=$('.filter-controls').getBoundingClientRect(),summary=$('#name-filters>summary').getBoundingClientRect();panel.style.top=(summary.bottom-controls.top+9)+'px';}
}
function syncNameFilters(){
 $('#match-brand-names').checked=state.matchBrandNames;
 $('#name-count').textContent=[state.matchBrandNames?'Auto':'',state.hiddenNames.length?state.hiddenNames.length+' hidden':''].filter(Boolean).join(' · ')||'Off';
 $('#hidden-name-list').innerHTML=state.hiddenNames.length?state.hiddenNames.map((name,index)=>`<button type="button" class="active-filter" data-remove-name="${index}" aria-label="Remove hidden name ${escape(name)}">${escape(name)} ${icon('close')}</button>`).join(''):'<p>No personal hidden names yet.</p>';
 $('#hidden-name-list').querySelectorAll('[data-remove-name]').forEach(button=>button.onclick=event=>{event.stopPropagation();removeHiddenName(Number(button.dataset.removeName));$('#hidden-name-input').focus();});
 $('#clear-hidden-names').disabled=!state.hiddenNames.length;
}
function dietNote(p){
 const ids=foodTypesForPlace(p),diets=FOOD_TYPES.filter(type=>type.diet&&ids.includes(type.id)).map(type=>type.name),listing=kosherListingFor(p),parts=[];
 if(listing)parts.push(`Kosher: listed${listing.agency?' as certified by '+escape(listing.agency):''} at ${escape(listing.address)} (<a href="${escape(listing.source)}" target="_blank" rel="noreferrer">${escape(listing.sourceTitle)}</a>).${listing.note?' '+escape(listing.note):''}`);
 else if(p.myKosher)parts.push('Kosher: you marked this place on this browser.');
 else if(p.osmKosher)parts.push('Kosher: OpenStreetMap contributors list this place as kosher.');
 const others=diets.filter(name=>!(name==='Kosher'&&parts.length));
 if(others.length)parts.push(`${escape(others.join(' · '))}: based on the place's ${escape(p.source||'map data')} listing or name.`);
 const checks=[diets.includes('Kosher')&&' Check the current kosher certification (hechsher) before relying on it.',diets.includes('Halal')&&' Check its halal certification before relying on it.',diets.some(name=>name!=='Kosher'&&name!=='Halal')&&' Confirm with the place before relying on it.'].filter(Boolean).join('');
 const note=parts.length?`<p class="diet-note">${parts.join(' ')}${checks}</p>`:'';
 const mark=DIET_CATEGORIES.includes(p.category)&&!listing?`<button type="button" class="text-button mark-kosher" id="mark-kosher" aria-pressed="${state.myKosher.has(p.id)}">${state.myKosher.has(p.id)?'Remove my kosher mark':'Mark as kosher'}</button>`:'';
 return note+mark;
}
function safeWebsite(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function showDetails(id,open=true,fallback){const found=[...state.places,...state.saved,...state.osmKosher.places].find(x=>x.id===id)||fallback;if(!found)return;const p=withKosherSources([found])[0];state.selected=id;const o=ownershipFor(p),c=category(p);const d=distance(state.origin,p);$('#detail-content').innerHTML=`<button class="dialog-close icon-button" id="close-detail" aria-label="Close place details">${icon('close')}</button><div class="detail-icon">${icon(c.icon)}</div><h2>${escape(p.name)}</h2><p class="detail-meta">${escape(c.name)}${foodTypeLabel(p)?' · '+escape(foodTypeLabel(p)):''} · ${miles(d)} from search center<br>${escape([p.address,p.addressCity].filter(Boolean).join(', ')||'Street address not available in the place data')}</p>${dietNote(p)}${ownershipBadges(o,p)}<div class="ownership-box"><h3>${escape(o.parent)}</h3><p>${escape(o.note)}</p>${localOperatorNote(o)?`<p class="local-operators">${escape(localOperatorNote(o))} This does not verify the owner of this location.</p>`:''}${o.headquarters&&headquartersDistanceMiles(p,o)!==null?`<p class="local-operators">Privately held, headquartered in ${escape(o.headquarters.city)}, ${escape(o.headquarters.state)} · about ${Math.round(headquartersDistanceMiles(p,o))} mi from this place${isLocalCorporation(p,o)?' (a local corporation for this area)':''}.</p>`:''}${o.publicListing?`<p class="stock-listing">Publicly traded · ${o.publicListing.exchanges.map(listing=>escape(listing.exchange)+': '+escape(listing.ticker)).join(' · ')}<br>${escape(o.publicListing.company)}<br><a class="listing-reference" href="${escape(o.publicListing.source)}" target="_blank" rel="noreferrer">Stock listing source ${icon('external')}</a><small>Listing checked ${escape(o.publicListing.checked)}</small></p>`:''}${o.source?`<a href="${escape(o.source)}" target="_blank" rel="noreferrer">${escape(o.sourceTitle)} ${icon('external')}</a><p class="ownership-date">Brand-level match · Source checked ${reviewedDate(o.checked)}<br>Local operator ownership is not independently verified.</p>`:'<p class="ownership-date">No verified source in our directory yet.</p>'}</div><div class="detail-actions"><a class="primary-button" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noreferrer">${icon('route')}Get directions</a><button class="detail-save" id="detail-save">${icon('bookmark')}${isSaved(id)?'Saved':'Save place'}</button></div>${p.id.startsWith('google/')?`<p class="google-attribution" translate="no">Google Maps</p><a class="detail-osm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${encodeURIComponent(p.googlePlaceId)}" target="_blank" rel="noreferrer">View on Google Maps ${icon('external')}</a>${(p.attributions||[]).map(a=>`<p class="provider-attribution">${safeWebsite(a.providerURI)?`<a href="${escape(safeWebsite(a.providerURI))}" target="_blank" rel="noreferrer">${escape(a.provider)}</a>`:escape(a.provider)}</p>`).join('')}`:`<a class="detail-osm" href="${p.id.startsWith('overture/')?'https://docs.overturemaps.org/guides/places/':'https://www.openstreetmap.org/'+escape(p.id)}" target="_blank" rel="noreferrer">${p.id.startsWith('overture/')?'About the Overture place data':'View place data on OpenStreetMap'} ${icon('external')}</a>`}${safeWebsite(p.website)?`<a class="detail-osm" href="${escape(safeWebsite(p.website))}" target="_blank" rel="noreferrer">Visit business website ${icon('external')}</a>`:''}`;$('#close-detail').onclick=()=>$('#detail-dialog').close();$('#detail-save').onclick=()=>toggleSaved(id);if($('#mark-kosher'))$('#mark-kosher').onclick=()=>{if(state.myKosher.has(id))state.myKosher.delete(id);else state.myKosher.add(id);persist(MY_KOSHER_KEY,[...state.myKosher]);render();showDetails(id,false,p);};if(open&&!$('#detail-dialog').open)$('#detail-dialog').showModal();}
async function fetchJSON(url,options={},timeout=18000){const controller=new AbortController();const signal=options.signal;const abort=()=>controller.abort();if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,timeout);try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error('Service returned '+response.status);return await response.json();}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}}
// Static hosts such as GitHub Pages have no /api route, so their build reads Overture's tiles from the browser instead.
const BROWSER_PLACES=document.querySelector('meta[name="local-lens-places"]')?.content==='browser';let browserLookup;
function placePage(params,page,signal){if(!BROWSER_PLACES)return fetchJSON('./api/places?'+params+'&page='+page,{signal},35000);browserLookup??=import('./overture-browser.js?v=20261029-radius2').then(module=>module.lookupPlacesPage);return browserLookup.then(lookup=>lookup(Number(params.get('lat')),Number(params.get('lng')),Number(params.get('radius')),page));}
async function loadPlaces({seed=false}={}){
 if(state.googleMode){
  const id=++requestId;fetchController?.abort();state.places=[];state.loadedAt=null;state.busy=true;state.loadError=false;state.cached=false;state.example=false;render();$('#search-map').hidden=true;
  try{
   if(!googleProvider)throw new Error('Google is not connected');
   const data=await searchGooglePlaces(googleProvider.Place,state.origin,state.radius,state.category,state.foodTypes,()=>{if(id!==requestId)throw new Error('Search replaced');});
   if(id!==requestId)return;state.places=data.places;state.loadedAt=data.fetchedAt;state.limit=60;state.busy=false;render();
  }catch{if(id!==requestId)return;state.busy=false;state.loadError=true;render();}
  return;
 }
 const id=++requestId;fetchController?.abort();fetchController=new AbortController();
 const key=areaKey(state.origin,state.radius),records=read('local-lens-nearby',[]);
 const cached=findNearbyCache(records,state.origin,state.radius),sameArea=state.loadedKey===key;
 if(!sameArea){state.places=cached?.places||[];state.loadedAt=cached?.loadedAt||null;state.loadedKey=key;}
 state.busy=true;state.loadError=false;state.cacheLabel=cached?'Saved nearby results':sameArea?state.cacheLabel:null;state.cached=!!cached||(sameArea&&state.cached);render();$('#search-map').hidden=true;
 if(seed){try{const data=await fetchJSON('./austin.json',{},5000);if(id!==requestId)return;state.places=fromOSM(data.elements);state.cached=true;state.cacheLabel='Example snapshot';state.loadedAt=data.osm3s?.timestamp_osm_base||null;state.busy=false;render();return;}catch{}}
 try{
  const params=new URLSearchParams({lat:state.origin.lat.toFixed(3),lng:state.origin.lng.toFixed(3),radius:state.radius});
  const signal=fetchController.signal;
  const data=await collectPlacePages(page=>placePage(params,page,signal),(done,total)=>{
   if(id!==requestId||!state.busy)return;
   const text=total>1?`Loading nearby places · ${done}/${total}`:'Finding places…';
   $('#result-count').textContent=text;if($('#loading-message'))$('#loading-message').textContent=text;
  },BROWSER_PLACES?8:3);
  if(id!==requestId)return;
  if(!Array.isArray(data.places)&&!Array.isArray(data.elements))throw new Error('Invalid place response');
  state.places=data.places||fromOSM(data.elements);state.loadedAt=data.dataDate||data.osm3s?.timestamp_osm_base||data.fetchedAt||new Date().toISOString();state.busy=false;state.loadError=!!data.stale;state.cached=!!data.stale;state.cacheLabel=data.stale?'Saved nearby results':null;state.limit=60;
  const record={format:PLACE_CACHE_FORMAT,key,origin:{...state.origin},radius:state.radius,places:state.places,loadedAt:state.loadedAt,savedAt:Number.isFinite(Date.parse(data.fetchedAt))?Date.parse(data.fetchedAt):Date.now()};
  try{localStorage.setItem('local-lens-nearby',JSON.stringify(storeNearbyCache(records,record)));}catch{}
  render();
 }catch{
  if(id!==requestId)return;
  fetchController.abort();state.busy=false;state.loadError=true;
  if(state.places.length){state.cached=true;state.cacheLabel='Saved nearby results';}
  render();
 }
}
function setArea(origin,name){state.origin=origin;state.area=name;state.example=false;state.mode='explore';state.limit=60;$('#search-results').hidden=true;$('#location-input').value=name;drawCenter();focusMap();loadPlaces();}
async function searchLocation(e){e.preventDefault();const q=$('#location-input').value.trim();if(!q)return;if(Date.now()-lastSearchAt<1100){toast('Please wait a moment between location searches.');return;}lastSearchAt=Date.now();$('#search-button').disabled=true;$('#search-results').hidden=false;$('#search-results').innerHTML='<p><span class="spinner"></span> Looking for that location…</p>';try{const results=await fetchJSON('https://nominatim.openstreetmap.org/search?'+new URLSearchParams({q,format:'jsonv2',limit:'5','accept-language':'en'}),{},15000);if(!Array.isArray(results)||!results.length){$('#search-results').innerHTML='<p>No location found. Try a city and state, or a more complete address.</p>';return;}$('#search-results').innerHTML=results.map((r,i)=>`<button class="search-result" data-index="${i}">${icon('pin')}<span>${escape(r.display_name)}</span></button>`).join('');$('#search-results').querySelectorAll('button').forEach(b=>b.onclick=()=>{const r=results[Number(b.dataset.index)];setArea({lat:Number(r.lat),lng:Number(r.lon)},r.display_name.split(',').slice(0,3).join(', '));});}catch{$('#search-results').innerHTML='<p>Location search is unavailable. Try again or use your location.</p>';}finally{$('#search-button').disabled=false;}}
function locate(){if(!navigator.geolocation){toast('Location is not supported in this browser. Enter a city or address instead.');return;}const b=$('#locate-button');b.disabled=true;b.innerHTML='<span class="spinner"></span> Finding your location…';navigator.geolocation.getCurrentPosition(p=>{b.disabled=false;b.innerHTML=icon('locate')+'Use my location';setArea({lat:p.coords.latitude,lng:p.coords.longitude},'Near your location');},e=>{b.disabled=false;b.innerHTML=icon('locate')+'Use my location';toast(e.code===1?'Location permission was declined. Enter a city or address to explore.':'Couldn’t get your location. Enter a city or address instead.');},{enableHighAccuracy:false,timeout:15000,maximumAge:120000});}
async function setMode(mode){
 state.mode=mode;state.limit=60;render();
 if(mode==='saved'&&state.googleMode&&state.googleIds.length&&!state.savedLoaded&&!state.savedBusy&&googleProvider){
  state.savedBusy=true;render();const data=await resolveGoogleSaved(googleProvider.Place,state.googleIds);
  state.saved=state.saved.filter(p=>!p.id.startsWith('google/')).concat(data.places.filter(p=>state.googleIds.includes(p.googlePlaceId)));state.savedUnavailable=data.unavailable.filter(id=>state.googleIds.includes(id));state.savedLoaded=true;state.savedBusy=false;render();
 }
 if(state.mode==='saved'&&filtered.length&&map){suppressMapSearch=true;map.fitBounds(filtered.map(p=>[p.lat,p.lng]),{padding:[60,60],maxZoom:15,animate:false});suppressMapSearch=false;$('#search-map').hidden=true;}else focusMap();
}

function setFiltersOpen(open){$('#filter-panel').hidden=!open;$('#filter-button').setAttribute('aria-expanded',open);if(open)syncLocalLevel();}
function setLocalLevel(level){state.localLevel=cleanLocalLevel(level);persist(LOCAL_LEVEL_KEY,state.localLevel);state.limit=60;render();}
$('#local-level').oninput=event=>setLocalLevel(Number(event.target.value));
$('#location-form').addEventListener('submit',searchLocation);$('#locate-button').onclick=locate;
$('#filter-button').onclick=()=>setFiltersOpen($('#filter-panel').hidden);$('#close-filters').onclick=()=>setFiltersOpen(false);$('#apply-filters').onclick=()=>setFiltersOpen(false);
for(const type of ['pe','corporate','unknown'])$('#hide-'+type).onchange=e=>{state.hidden=e.target.checked?[...state.hidden.filter(x=>x!==type),type]:state.hidden.filter(x=>x!==type);persist(OWNERSHIP_PREFERENCE_KEY,state.hidden);render();};
$('#hidden-name-form').onsubmit=event=>{
 event.preventDefault();const input=$('#hidden-name-input'),value=input.value.trim(),status=$('#name-filter-status');
 if(!cleanHiddenNames([value]).length){status.textContent='Enter a name containing letters or numbers, up to '+MAX_NAME_LENGTH+' characters.';return;}
 if(state.hiddenNames.length>=MAX_HIDDEN_NAMES){status.textContent='You can hide up to '+MAX_HIDDEN_NAMES+' names. Remove one to add another.';return;}
 const names=cleanHiddenNames([...state.hiddenNames,value]);if(names.length===state.hiddenNames.length){status.textContent='That name is already in your list.';return;}
 state.hiddenNames=names;input.value='';status.textContent='Name added.';saveNameFilters();
};
$('#match-brand-names').onchange=event=>{state.matchBrandNames=event.target.checked;saveNameFilters();};
$('#clear-hidden-names').onclick=()=>{state.hiddenNames=[];$('#name-filter-status').textContent='Your personal names were cleared.';saveNameFilters();};
$('#name-filters').addEventListener('toggle',positionNamePanel);
$('#done-names').onclick=$('#close-names').onclick=()=>$('#name-filters').open=false;
$('#clear-food').onclick=()=>{state.foodTypes=[];state.limit=60;render();refreshGoogleSearch();};$('#done-food').onclick=$('#close-food').onclick=()=>$('#food-types').open=false;
$('#hide-chains').onchange=event=>{state.hidden=setAllBrandsHidden(state.hidden,event.target.checked);persist(OWNERSHIP_PREFERENCE_KEY,state.hidden);render();};
$('#reset-ownership').onclick=()=>{state.hidden=[];persist(OWNERSHIP_PREFERENCE_KEY,[]);render();};
$('#sort-select').onchange=e=>{state.sort=e.target.value;render();};// The same distance choices appear above the list and on the map, and stay in sync.
const RADIUS_OPTIONS=[[805,'½ mi'],[1609,'1 mi'],[3219,'2 mi'],[8047,'5 mi'],[16093,'10 mi']];
document.querySelectorAll('.radius-select').forEach(select=>{select.innerHTML=RADIUS_OPTIONS.map(([meters,label])=>`<option value="${meters}">${label}</option>`).join('');select.value=String(state.radius);select.onchange=e=>{state.radius=Number(e.target.value);document.querySelectorAll('.radius-select').forEach(other=>other.value=e.target.value);if(state.radius>8047)toast('Wider searches take longer to load.');focusMap();loadPlaces();};});
$('#search-map').onclick=()=>{const c=map.getCenter();setArea({lat:c.lat,lng:c.lng},'Selected map area');};$('#recenter-button').onclick=()=>focusMap();
$('#explore-tab').onclick=()=>setMode('explore');$('#saved-tab').onclick=()=>setMode('saved');
$('#about-button').onclick=$('#data-button').onclick=()=>$('#about-dialog').showModal();$('.about-done').onclick=$('.about-dialog .dialog-close').onclick=()=>$('#about-dialog').close();
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
document.addEventListener('click',e=>{if(!e.target.closest('.filter-wrap'))setFiltersOpen(false);if(!e.target.closest('#food-types'))$('#food-types').open=false;if(!e.target.closest('#name-filters')&&!e.target.closest('#empty-action'))$('#name-filters').open=false;if(!e.target.closest('.search-row')&&!e.target.closest('#search-results'))$('#search-results').hidden=true;});document.addEventListener('keydown',e=>{if(e.key==='Escape'){setFiltersOpen(false);$('#food-types').open=false;$('#name-filters').open=false;$('#search-results').hidden=true;}});
$('#mobile-view-toggle').onclick=()=>{const active=$('.workspace').classList.toggle('show-map');$('#mobile-view-toggle').innerHTML=icon(active?'grid':'pin')+`<span>${active?'List view':'Map view'}</span>`;if(map){map.invalidateSize();$('#search-map').hidden=true;}};
window.addEventListener('resize',()=>{map?.invalidateSize();positionNamePanel();});
async function start(){
 renderCategories();renderFoodFilters();render();
 if(state.googleMode){
  state.example=false;state.busy=true;render();$('.map-panel').classList.add('google-map');$('#data-attribution').innerHTML='<span class="google-attribution" translate="no">Google Maps</span> · Ownership research by Local Lens';
  $('#source-notice').innerHTML='Business listings from Google Maps. Each category returns up to 20 selected nearby places before your filters. <a href="connection.html">Connection settings</a>';
  $('.about-source').innerHTML='Business listings and map: <span class="google-attribution" translate="no">Google Maps</span>. Ownership research: Local Lens.';$('#place-data-description').textContent='Google Maps supplies business listings and the map when connected on this browser. Closed and future-opening listings are excluded when Google reports that status. Search returns a limited selection, not every business in an area. Google listing data stays in memory; only place IDs are saved for bookmarks and refreshed when you open Saved. Your key and preferences stay in this browser. Submitted location searches still use Nominatim. Google receives the map and Places requests needed to display the area. Google data can contain errors; ownership labels are researched separately by Local Lens.';
  try{googleProvider=await createGoogleMap(connectionKey,$('#map'),state.origin,()=>{if(!suppressMapSearch&&state.mode==='explore')$('#search-map').hidden=false;},id=>showDetails(id));map=googleProvider.map;drawCenter();}
  catch{$('#map').innerHTML='<div class="map-failure">Google Maps could not connect. <a href="connection.html">Check connection settings</a>.</div>';}
  render();await loadPlaces();if(state.mode==='saved')setMode('saved');
 }else{initMap();$('#source-notice').innerHTML='Using the published Overture business dataset. <a href="connection.html">Connect Google Maps for current listings →</a>';loadPlaces({seed:true});}
}
start();
