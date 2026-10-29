export async function collectPlacePages(fetchPage,onProgress=()=>{},concurrency=3){
 const first=await fetchPage(0);
 // Retain compatibility with the attributed example snapshot and older locally cached responses.
 if(Array.isArray(first.elements)&&!first.places)return first;
 const total=first.totalPages;
 if(!Array.isArray(first.places)||!Number.isInteger(total)||total<1||total>128)throw new Error('Invalid place response');
 const pages=[first];let done=1;onProgress(done,total);
 for(let start=1;start<total;start+=concurrency){
  const indices=Array.from({length:Math.min(concurrency,total-start)},(_,i)=>start+i);
  await Promise.all(indices.map(async page=>{
   const data=await fetchPage(page);
   if(!Array.isArray(data.places)||data.page!==page||data.release!==first.release||data.totalPages!==total)throw new Error('Incomplete place response');
   pages.push(data);onProgress(++done,total);
  }));
 }
 const unique=new Map();for(const page of pages)for(const place of page.places)unique.set(place.id,place);
 return {...first,places:[...unique.values()],stale:pages.some(p=>p.stale),complete:true};
}
