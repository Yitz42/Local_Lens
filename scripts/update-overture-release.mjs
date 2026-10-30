// Moves the app to the newest Overture places archive before the current one is deleted (Overture keeps releases
// for about 60 days). Lists the published tile archives, picks the newest release whose places.pmtiles exists, and
// rewrites RELEASE and DATA_DATE in worker/overture.js. Run by .github/workflows/overture-release.yml.
// Usage: node scripts/update-overture-release.mjs [--dry-run]
// Prints the new release, or nothing when already current. Writes `release=` to $GITHUB_OUTPUT when it changes.
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const BUCKET='https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com';
const FILE=new URL('../worker/overture.js',import.meta.url);

// Release names look like 2026-10-21.0; later dates, then higher suffixes, are newer.
export function compareReleases(a,b){
 const [da,na]=a.split('.'),[db,nb]=b.split('.');
 return da===db?Number(na)-Number(nb):da<db?-1:1;
}

async function listReleases(){
 const response=await fetch(`${BUCKET}/?list-type=2&prefix=tiles/&delimiter=/`);
 if(!response.ok)throw new Error(`Listing Overture releases failed: HTTP ${response.status}`);
 const xml=await response.text();
 return [...xml.matchAll(/<Prefix>tiles\/(\d{4}-\d{2}-\d{2}\.\d+)\/<\/Prefix>/g)].map(m=>m[1]).sort(compareReleases);
}

async function hasPlaces(release){
 const response=await fetch(`${BUCKET}/tiles/${release}/places.pmtiles`,{method:'HEAD'});
 return response.ok;
}

async function main(dryRun){
 const source=readFileSync(FILE,'utf8');
 const current=source.match(/export const RELEASE='([^']+)';/)?.[1];
 if(!current)throw new Error('RELEASE not found in worker/overture.js');
 const releases=await listReleases();
 if(!releases.length)throw new Error('No Overture releases listed');
 let latest=null;
 for(const release of [...releases].reverse()){if(await hasPlaces(release)){latest=release;break;}}
 if(!latest)throw new Error('No Overture release has a places archive');
 if(compareReleases(latest,current)<=0){console.error(`Already on the newest places archive (${current}).`);return;}

 const date=latest.split('.')[0];
 const updated=source
  .replace(/export const RELEASE='[^']+';/,`export const RELEASE='${latest}';`)
  .replace(/export const DATA_DATE='[^']+';/,`export const DATA_DATE='${date}T00:00:00Z';`);
 if(!dryRun)writeFileSync(FILE,updated);
 console.log(latest);
 if(process.env.GITHUB_OUTPUT&&!dryRun)appendFileSync(process.env.GITHUB_OUTPUT,`release=${latest}\nprevious=${current}\n`);
}

if(import.meta.url===pathToFileURL(process.argv[1]).href)await main(process.argv.includes('--dry-run'));
