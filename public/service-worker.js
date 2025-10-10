// ✅ FiskeyTrade Service Worker (v1.1)

const CACHE_NAME = "fiskey-cache-v1";
const OFFLINE_URL = "/offline.html";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  OFFLINE_URL,
];

// ✅ Install: Cache app shell and core files
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker: Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching essential files...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate new SW immediately
});

// ✅ Activate: Remove old caches
self.addEventListener("activate", (event) => {
  console.log("⚙️ Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("🗑️ Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim(); // Control open pages immediately
});

// ✅ Fetch: Cache-first, then network fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache
        return cachedResponse;
      }

      // Fetch from network and cache dynamically
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(OFFLINE_URL)); // Fallback offline page
    })
  );
});

// ✅ Listen for skipWaiting message (for updates)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("🔄 New version ready, activating...");
    self.skipWaiting();
  }
});
