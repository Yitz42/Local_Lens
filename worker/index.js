import {lookupPlacesPage,RELEASE} from './overture.js';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.csv':'text/csv; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const FRESH_SECONDS=1800,STALE_SECONDS=7*86400;
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
export function createWorker(assets={},dependencies={}){
 const lookup=dependencies.lookup||lookupPlacesPage,now=dependencies.now||(()=>Date.now()),memory=new Map(),pending=new Map();
 function remember(key,data){memory.delete(key);memory.set(key,data);while(memory.size>16)memory.delete(memory.keys().next().value);}
 async function places(request,ctx){
  const url=new URL(request.url),lat=Number(url.searchParams.get('lat')),lng=Number(url.searchParams.get('lng')),radius=Number(url.searchParams.get('radius')),page=Number(url.searchParams.get('page')||0);
  if(!url.searchParams.get('lat')?.trim()||!url.searchParams.get('lng')?.trim()||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>85||Math.abs(lng)>180||!Number.isInteger(radius)||radius<500||radius>10000||!Number.isInteger(page)||page<0||page>127)return json({error:'Choose a valid location, radius, and place page.'},400);
  const a=Number(lat.toFixed(3)),b=Number(lng.toFixed(3)),keyURL=new URL('/_place-cache/overture/'+RELEASE,url.origin);
  keyURL.search=new URLSearchParams({lat:a,lng:b,radius,page}).toString();
  const key=new Request(keyURL),staleKey=new Request(keyURL.href+'&stale=1'),cache=dependencies.cache||globalThis.caches?.default,recent=memory.get(keyURL.href);
  if(recent&&now()-Date.parse(recent.fetchedAt)<FRESH_SECONDS*1000)return json({...recent,cache:'memory'});
  if(cache){try{const hit=await cache.match(key);if(hit){const data=await hit.json();remember(keyURL.href,data);return json({...data,cache:'edge'});}}catch{}}
  if(!pending.has(keyURL.href)){
   const task=(async()=>{
    try{
     let data;
     for(let attempt=0;attempt<2;attempt++){
      try{data=await lookup(a,b,radius,page);break;}catch(error){if(error instanceof RangeError)throw error;if(attempt===1)throw error;}
     }
     if(!Array.isArray(data?.places)||!Number.isInteger(data.totalPages))throw new Error('Invalid place data');
     data={...data,stale:false};remember(keyURL.href,data);
     if(cache){const body=JSON.stringify(data),save=Promise.all([
      cache.put(key,new Response(body,{headers:{'content-type':'application/json','cache-control':'public, max-age='+FRESH_SECONDS}})),
      cache.put(staleKey,new Response(body,{headers:{'content-type':'application/json','cache-control':'public, max-age='+STALE_SECONDS}}))
     ]).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(save);else await save;}
     return data;
    }catch(error){
     if(error instanceof RangeError)throw error;
     if(recent&&now()-Date.parse(recent.fetchedAt)<STALE_SECONDS*1000)return {...recent,stale:true,cache:'memory-stale'};
     if(cache){try{const hit=await cache.match(staleKey);if(hit)return {...await hit.json(),stale:true,cache:'stale'};}catch{}}
     throw error;
    }
   })();pending.set(keyURL.href,task);task.then(()=>pending.delete(keyURL.href),()=>pending.delete(keyURL.href));
  }
  try{return json(await pending.get(keyURL.href));}catch(error){return json({error:error instanceof RangeError?error.message:'Place data is temporarily unavailable. Previously loaded results remain available.'},error instanceof RangeError?400:503);}
 }
 return {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
  if(url.pathname==='/api/places')return places(request,ctx);
  const path=url.pathname==='/'?'/index.html':url.pathname,body=assets[path];
  if(typeof body!=='string')return new Response('Not found',{status:404});
  const extension=path.slice(path.lastIndexOf('.'));
  return new Response(request.method==='HEAD'?null:body,{headers:{'content-type':MIME[extension]||'text/plain; charset=utf-8','cache-control':extension==='.html'||extension==='.js'||path==='/brands.json'||path==='/brands.csv'?'no-cache':'public, max-age=3600','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
 }};
}
export default createWorker(typeof ASSETS==='undefined'?{}:ASSETS);
