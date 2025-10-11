// ✅ FiskeyTrade Service Worker (v1.4 combined & updated)

const CACHE_NAME = "fiskeytrade-cache-v1.4";
const OFFLINE_URL = "/offline.html";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
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
  self.skipWaiting();
});

// ✅ Activate: Remove old caches
self.addEventListener("activate", (event) => {
  console.log("⚙️ Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch: Cache-first, network fallback, offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "opaque"
          ) {
            return networkResponse;
          }

          // Clone response and cache dynamically
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        })
        .catch(() => caches.match(OFFLINE_URL)) // Serve offline page if network fails
    })
  );
});

// ✅ Handle manual skipWaiting trigger
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("🔄 New version ready, activating...");
    self.skipWaiting();
  }

  // ✅ Optional: Pre-cache dynamic URLs like blogs or social media icons
  if (event.data && event.data.type === "PRECACHE_URLS" && Array.isArray(event.data.urls)) {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(event.data.urls).then(() => {
        console.log("📥 Dynamic URLs pre-cached:", event.data.urls);
      });
    });
  }
});

// ✅ Listen for PWA install event (for logging)
self.addEventListener("appinstalled", () => {
  console.log("🎉 FiskeyTrade PWA installed successfully!");
});
