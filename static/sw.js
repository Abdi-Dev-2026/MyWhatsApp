/* static/sw.js */
const CACHE_NAME = 'whatsapp-clone-v1';
const urlsToCache = [
  '/',
  '/static/css/style.css', // Hubi magaca file-kaaga CSS
  '/static/js/chat_room.js',
  '/static/images/icon-192x192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});