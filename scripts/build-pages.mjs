// Builds a static copy of the app for GitHub Pages in dist/pages.
// Pages has no /api route, so Overture place lookups are bundled for the browser.
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {cp,readFile,writeFile,rm,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('dist/pages/',root);
await rm(out,{recursive:true,force:true});
await cp(new URL('public/',root),out,{recursive:true});
await build({entryPoints:[fileURLToPath(new URL('worker/overture.js',root))],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:fileURLToPath(new URL('overture-browser.js',out))});
const meta='<meta name="local-lens-places" content="browser">';
for(const name of (await readdir(out)).filter(name=>name.endsWith('.html'))){
 const file=new URL(name,out),html=await readFile(file,'utf8');
 if(!/<head>/i.test(html))throw new Error(name+' has no <head>');
 // Keep the charset declaration first in <head>.
 await writeFile(file,/<meta charset[^>]*>/i.test(html)?html.replace(/<meta charset[^>]*>/i,match=>match+meta):html.replace(/<head>/i,'<head>'+meta));
}
await writeFile(new URL('.nojekyll',out),'');
console.log('Built static GitHub Pages site in dist/pages.');
