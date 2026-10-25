import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const manifest=JSON.parse(await readFile(new URL('../dist/.openai/hosting.json',import.meta.url),'utf8'));
assert.ok(manifest.project_id);assert.equal(manifest.static,undefined);
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(typeof worker.fetch,'function');
for(const [path,type]of [['/','text/html'],['/app.js','text/javascript'],['/google-places.js','text/javascript'],['/connection.html','text/html'],['/connection.js','text/javascript'],['/privacy.html','text/html'],['/terms.html','text/html'],['/ownership.js','text/javascript'],['/ownership-categories.js','text/javascript'],['/food-types.js','text/javascript'],['/brand-directory.js','text/javascript'],['/directory.html','text/html'],['/firms.html','text/html'],['/firms.js','text/javascript'],['/pe-firms.json','application/json'],['/pe-holdings.csv','text/csv'],['/directory.js','text/javascript'],['/brands.json','application/json'],['/brands.csv','text/csv'],['/vendor/leaflet.js','text/javascript'],['/austin.json','application/json']]){const response=await worker.fetch(new Request('https://local.test'+path));assert.equal(response.status,200);assert.ok(response.headers.get('content-type').startsWith(type));}
console.log('Worker artifact and embedded app assets validated.');
