// Only the public offline screen and its logo are stored on this device.
const offlineCache = 'niger-merveilles-offline-v1'
const offlinePage = '/app-offline.html'
const logo = '/images/niger-merveilles-mark.svg'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(offlineCache).then((cache) => cache.addAll([offlinePage, logo])))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('niger-merveilles-offline-') && key !== offlineCache) await caches.delete(key)
    }
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname === logo) {
    event.respondWith(caches.open(offlineCache).then(async (cache) => (await cache.match(logo)) || fetch(request)))
    return
  }
  if (request.mode !== 'navigate' || /^\/(?:api|admin(?:-login)?)(?:\/|$)/.test(url.pathname)) return
  event.respondWith(fetch(request).catch(async () => {
    const page = await (await caches.open(offlineCache)).match(offlinePage)
    return page ? new Response(page.body, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }) : Response.error()
  }))
})
