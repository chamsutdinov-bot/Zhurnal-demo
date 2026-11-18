const C="uchet-zhurnal-demo-20261118",SHELL=["./", "index.html", "master.html", "manifest.webmanifest", "manifest-master.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "icon-master-192.png", "icon-master-512.png", "apple-touch-icon-master.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:"reload"}).then(r=>r.ok&&c.put(u==="./"?"index.html":u,r)).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function fresh(req,key){const c=await caches.open(C);try{const r=await fetch(req,{cache:"no-store"});if(r.ok)c.put(key,r.clone());return r}catch(e){return null}}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const p=u.pathname,isNav=r.mode==="navigate";
  if(p.endsWith("/version.json")||p.includes("access"))return;
  if(isNav){
    e.respondWith((async()=>{
      const base=p.split("/").pop(),file=(base==="master.html")?"master.html":"index.html",key=file,c=await caches.open(C);
      if(u.searchParams.has("v")){const n=await fresh(r.url.split("?")[0],key);if(n)return n}
      const hit=await c.match(key);
      if(hit){e.waitUntil(fresh(u.origin+u.pathname.replace(/[^/]*$/,file),key));return hit}
      return (await fresh(r,key))||new Response("Нет связи",{status:503})
    })());return}
  if(/\.(png|webmanifest)$/.test(p)){
    e.respondWith(caches.open(C).then(async c=>{const h=await c.match(p.split("/").pop());return h||fetch(r)}))}
});
