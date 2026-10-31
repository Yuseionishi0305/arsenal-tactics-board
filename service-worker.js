'use strict';
const PREFIX='arsenal-tactics-', CACHE=PREFIX+'v3-landscape';
const APP=new URL('./index.html',self.location.href).href;
const FILES=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'].map(p=>new URL(p,self.location.href).href);
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 for(const url of FILES){const response=await fetch(url,{cache:'reload'});if(!response.ok)throw new Error('Cache failed: '+url);await cache.put(url,response)}
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const request=e.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(request.mode==='navigate'){
  e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok)return response;return(await cache.match(APP))||response}catch{return(await cache.match(APP))||new Response('初回はオンラインで開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}})());return;
 }
 if(FILES.includes(url.href))e.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(request);if(saved)return saved;try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response}catch{return new Response('',{status:503})}})());
});
