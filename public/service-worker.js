/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'my-site-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const urlsToCache = [
  '/',
  '/styles.css',
  '/db.js',
  '/manifest.json',
  '/index.js',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => cache.match(event.request));
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
