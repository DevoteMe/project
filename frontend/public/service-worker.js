// This is a service worker file that will be compiled and placed in the public directory

// Cache names
const STATIC_CACHE = "static-cache-v1"
const DYNAMIC_CACHE = "dynamic-cache-v1"
const API_CACHE = "api-cache-v1"
const IMAGE_CACHE = "image-cache-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  // Add other static assets here
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE]

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName))
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete)
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Helper function to determine cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url)

  // API requests
  if (url.pathname.startsWith("/api/")) {
    return {
      cacheName: API_CACHE,
      strategy: "network-first",
      maxAge: 60 * 5, // 5 minutes
    }
  }

  // Image requests
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) ||
    url.pathname.includes("/images/") ||
    url.pathname.includes("/thumbnails/")
  ) {
    return {
      cacheName: IMAGE_CACHE,
      strategy: "cache-first",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  }

  // HTML pages
  if (url.pathname.endsWith("/") || url.pathname.endsWith(".html")) {
    return {
      cacheName: DYNAMIC_CACHE,
      strategy: "network-first",
      maxAge: 60 * 60, // 1 hour
    }
  }

  // Default - static assets
  return {
    cacheName: STATIC_CACHE,
    strategy: "cache-first",
    maxAge: 60 * 60 * 24, // 1 day
  }
}

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  const strategy = getCacheStrategy(event.request)

  if (strategy.strategy === "network-first") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response
          const clonedResponse = response.clone()
          caches.open(strategy.cacheName).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // If not in cache, return offline page for HTML requests
            if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("/offline")
            }
            return new Response("Network error occurred", { status: 408 })
          })
        }),
    )
  } else if (strategy.strategy === "cache-first") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request).then((response) => {
          const clonedResponse = response.clone()
          caches.open(strategy.cacheName).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
          return response
        })
      }),
    )
  }
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-likes") {
    event.waitUntil(syncLikes())
  } else if (event.tag === "sync-comments") {
    event.waitUntil(syncComments())
  }
})

// Helper functions for background sync
async function syncLikes() {
  // Implementation for syncing likes when back online
  // This would retrieve stored likes from IndexedDB and send them to the server
}

async function syncComments() {
  // Implementation for syncing comments when back online
  // This would retrieve stored comments from IndexedDB and send them to the server
}

