/* Vedoy Deliver: only an offline fallback is cached. Never cache user, auth or delivery responses. */
const CACHE="vedoy-deliver-offline-v1";
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.add("/offline.html")).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vedoy-deliver-offline-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET"||event.request.mode!=="navigate")return;
 event.respondWith(fetch(event.request).catch(async()=>await caches.match("/offline.html")||Response.error()));
});
