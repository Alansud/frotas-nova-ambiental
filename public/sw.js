// Nova Ambiental Frotas — Service Worker
// Responsável por: cache offline + suporte a notificações push

const CACHE_NAME = 'nova-ambiental-v1'

// Páginas e assets estáticos a serem cacheados no install
const STATIC_URLS = [
  '/dashboard',
  '/veiculos',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_URLS).catch(() => {
        // Ignorar falhas individuais no pré-cache
      })
    )
  )
  self.skipWaiting()
})

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch — Estratégia: Network-first com fallback para cache ────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Assets estáticos do Next.js: cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(req, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Requests de API: sempre network, sem cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return

  // Páginas HTML: network-first, fallback cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(req, clone))
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Nova Ambiental Frotas', body: '', url: '/dashboard' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    // payload não é JSON
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'na-frotas',
      data: { url: data.url },
    })
  )
})

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes(targetUrl))
        if (existing) return existing.focus()
        return clients.openWindow(targetUrl)
      })
  )
})
