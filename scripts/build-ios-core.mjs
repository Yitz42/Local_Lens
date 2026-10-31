// Bundles ios/core-entry.js into one script for the iOS app's JavaScriptCore context.
// Usage: node scripts/build-ios-core.mjs [output file]. Xcode runs this on every build.
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=new URL('../',import.meta.url);
const outfile=process.argv[2]?resolve(process.argv[2]):fileURLToPath(new URL('dist/ios/local-lens-core.js',root));
await build({
 entryPoints:[fileURLToPath(new URL('ios/core-entry.js',root))],bundle:true,format:'iife',platform:'neutral',target:'es2020',minify:true,
 mainFields:['module','main'],outfile,logLevel:'warning',
 // JavaScriptCore has no fetch API. pmtiles' FetchSource (unused here) still builds a Headers object when
 // constructed, and its tile cache tracks requests with AbortController, so both get minimal stand-ins.
 banner:{js:`if(typeof Headers==="undefined")globalThis.Headers=class{constructor(){}set(){}get(){return null}};
if(typeof AbortController==="undefined"){class AbortSignal{constructor(){this.aborted=false;this.listeners=[]}addEventListener(type,fn){if(type==="abort")this.listeners.push(fn)}removeEventListener(type,fn){this.listeners=this.listeners.filter(item=>item!==fn)}}
globalThis.AbortController=class{constructor(){this.signal=new AbortSignal()}abort(){if(this.signal.aborted)return;this.signal.aborted=true;for(const fn of this.signal.listeners.splice(0))fn()}};}`}
});
console.log('Built iOS core bundle at '+outfile);
