import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFile,readdir,mkdir,writeFile,rm} from 'node:fs/promises';
const root=new URL('../',import.meta.url),assets={};
async function collect(url,prefix=''){for(const item of await readdir(url,{withFileTypes:true})){const name=prefix+'/'+item.name,path=new URL(item.name+(item.isDirectory()?'/':''),url);if(item.isDirectory())await collect(path,name);else assets[name]=await readFile(path,'utf8');}}
await collect(new URL('public/',root));
const source=await readFile(new URL('worker/index.js',root),'utf8');
await rm(new URL('dist/',root),{recursive:true,force:true});
await mkdir(new URL('dist/server/',root),{recursive:true});await mkdir(new URL('dist/.openai/',root),{recursive:true});
const bundled=await build({stdin:{contents:'const ASSETS='+JSON.stringify(assets)+';\n'+source,resolveDir:fileURLToPath(new URL('worker/',root)),loader:'js'},bundle:true,format:'esm',platform:'browser',target:'es2022',write:false});
await writeFile(new URL('dist/server/index.js',root),bundled.outputFiles[0].contents);
await writeFile(new URL('dist/.openai/hosting.json',root),await readFile(new URL('.openai/hosting.json',root)));
console.log('Built self-contained Sites Worker with '+Object.keys(assets).length+' embedded assets.');
