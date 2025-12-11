const CACHE_NAME = 'emily-vendas-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/produtos.html',
  '/vendas.html',
  '/css/style.css',
  '/js/clientes.js',
  '/js/produtos.js',
  '/manifest.json'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k)=>{ if(k!==CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((resp) => resp || fetch(evt.request))
  );
});
