self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open("fiskey-cache-v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/manifest.json"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== "fiskey-cache-v1")
          .map((name) => caches.delete(name))
      );
    })
  );
});
