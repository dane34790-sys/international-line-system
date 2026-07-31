const CACHE_NAME = 'ils-russia-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './earth.js',
  './images/employee-bg.png',
  './images/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
