// پاک کردن همه کش‌های قدیمی
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// مستقیم از نتورک - هیچی کش نکن
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
