const CACHE_NAME = 'whatsapp-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/style.css', // Hubi magaca file-kaaga CSS
  '/static/js/main.js',
  '/static/images/logo.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetching Resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
self.addEventListener('sync', event => {
    if (event.tag === 'send-offline-messages') {
        event.waitUntil(sendMessagesToServer());
    }
});

async function sendMessagesToServer() {
    // 1. Ka soo saar fariimaha IndexedDB
    const messages = await getMessagesFromIndexedDB(); 

    // 2. Mid mid ugu dir Server-ka (Railway)
    for (const msg of messages) {
        try {
            await fetch('/api/send-message/', { // Hubi URL-kaaga Django
                method: 'POST',
                body: JSON.stringify(msg),
                headers: { 'Content-Type': 'application/json' }
            });
            // 3. Haddii ay guuleysato, ka tirtir IndexedDB
            await deleteMessageFromIndexedDB(msg.id);
        } catch (err) {
            console.error("Wali waa offline ama error ayaa jira", err);
        }
    }
}