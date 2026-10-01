const CACHE_NAME = "naragajok-iphone12-router-v2.3.0";
const PREFIX = "naragajok-iphone12-router-";
const APP_FILES = [
  "./",
  "./index.html",
  "./나라가족_라우터.html",
  "./manifest.webmanifest",
  "./router-core.js",
  "./vendor/qrcode.js",
  "./vendor/qrcode_UTF8.js",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];
const APP_URLS = new Set(
  APP_FILES.map((path) => new URL(path, self.registration.scope).href),
);
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !APP_URLS.has(url.href)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      let timeout;
      try {
        const response = await Promise.race([
          fetch(event.request, { cache: "no-cache" }),
          new Promise((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error("Network timeout")),
              4000,
            );
          }),
        ]);
        if (response.ok) {
          await cache.put(event.request, response.clone());
          return response;
        }
        return (await cache.match(event.request)) || response;
      } catch (error) {
        return (await cache.match(event.request)) || Response.error();
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
});
