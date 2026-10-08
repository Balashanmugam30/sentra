const SENTRA_CACHE = "sentra-mobile-v2";
const APP_SHELL = [
  "/mobile",
  "/mobile/home",
  "/mobile/alert",
  "/mobile/route",
  "/mobile/sos",
  "/mobile/staff",
  "/mobile/responder",
  "/mobile/settings",
  "/mobile/offline",
  "/mobile/about",
  "/manifest.json",
  "/icons/sentra-icon.svg",
  "/icons/sentra-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SENTRA_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SENTRA_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SENTRA_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/mobile/offline"))),
  );
});
