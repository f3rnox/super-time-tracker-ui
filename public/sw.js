const CACHE_NAME = 'super-time-tracker-cache-v3'
const OFFLINE_URL = '/offline'
const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/favicon.ico',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
]
const APP_ROUTES = [
  '/',
  '/today',
  '/sheets',
  '/reporting',
  '/search',
  '/pomodoro',
  '/settings',
  '/settings/display',
  '/settings/goals',
  '/settings/pomodoro',
  '/settings/ai-suggestions',
  '/settings/cloud-sync',
  '/settings/data',
  '/settings/tags',
  '/login',
  '/register',
  OFFLINE_URL,
]

const is_next_static_asset_request = (url) => url.pathname.startsWith('/_next/static/')

const get_cache_key = (request) => {
  const url = new URL(request.url)

  if (is_next_static_asset_request(url)) {
    return `${url.origin}${url.pathname}`
  }

  return request
}

const warm_app_routes_cache = async () => {
  const cache = await caches.open(CACHE_NAME)

  await Promise.all(
    APP_ROUTES.map(async (route) => {
      try {
        const response = await fetch(route, { cache: 'no-store' })

        if (response.ok) {
          await cache.put(route, response.clone())
        }
      } catch {
        // Ignore failures while warming cache (offline or route unavailable).
      }
    }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => warm_app_routes_cache()),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
          return Promise.resolve()
        }),
      ),
    ),
  )
  event.waitUntil(warm_app_routes_cache())
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const request_url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (network_response) => {
          if (network_response.ok) {
            const cache = await caches.open(CACHE_NAME)
            await cache.put(get_cache_key(request), network_response.clone())
          }
          return network_response
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME)
          const cached_route = await cache.match(get_cache_key(request))

          if (cached_route !== undefined) {
            return cached_route
          }

          const cached_offline = await cache.match(OFFLINE_URL)
          return cached_offline ?? Response.error()
        }),
    )
    return
  }

  if (request_url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(get_cache_key(request)).then((cached_response) => {
      if (cached_response !== undefined) {
        return cached_response
      }

      return fetch(request)
        .then((network_response) => {
          if (network_response.ok) {
            const copy = network_response.clone()
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(get_cache_key(request), copy))
          }
          return network_response
        })
        .catch(() => Response.error())
    }),
  )
})
