const CACHE_NAME = 'ils-russia-v1';
const urlsToCache = [
  '/international-line-system/',
  '/international-line-system/index.html',
  '/international-line-system/style.css',
  '/international-line-system/app.js',
  '/international-line-system/earth.js',
  '/international-line-system/images/employee-bg.png',
  '/international-line-system/images/auth-bg.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
