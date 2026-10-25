import {GOOGLE_KEY_STORAGE,googleKey} from './google-places.js';
const status=document.querySelector('#connection-status'),disconnect=document.querySelector('#disconnect-google');
if(googleKey()){status.textContent='A key is saved on this browser. Google checks API access when the map loads.';disconnect.hidden=false;}
document.querySelector('#google-connection-form').onsubmit=event=>{
 event.preventDefault();const input=document.querySelector('#google-key'),key=input.value.trim();
 if(!/^AIza[A-Za-z0-9_-]{30,}$/.test(key)){status.textContent='Enter a Google Maps API key beginning with AIza. Do not use a service-account key or a server credential.';return;}
 try{localStorage.setItem(GOOGLE_KEY_STORAGE,key);input.value='';location.assign('./');}catch{status.textContent='This browser could not save the connection. Allow site storage and try again.';}
};
disconnect.onclick=()=>{try{localStorage.removeItem(GOOGLE_KEY_STORAGE);location.assign('./');}catch{status.textContent='The browser could not remove the connection.';}};
