// Service Worker der Web-Version (WEB-6). Zweiter Besuch: CanvasKit (8 MB), Bundles, Schriften und
// Bilder kommen aus dem Speicher statt übers Netz. Alles unter /_expo/static/ und /assets/ trägt einen
// Inhalts-Hash im Namen, ändert sich also nie: zuerst Speicher, sonst Netz. Die Seite selbst
// (index.html und Routen) immer zuerst übers Netz, damit ein neuer Stand von main sofort ankommt;
// ohne Netz die gespeicherte Seite.

const CACHE = 'potpou-v1';
const MAX_ENTRIES = 120;
const SCOPE = new URL(self.registration.scope).pathname; // "/pou/"

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('potpou-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isImmutable(url) {
  return url.pathname.startsWith(`${SCOPE}_expo/static/`) || url.pathname.startsWith(`${SCOPE}assets/`);
}

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok && response.status === 200) {
    await cache.put(request, response.clone());
    trim(cache);
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(`${SCOPE}`, response.clone());
    return response;
  } catch (error) {
    const hit = await cache.match(`${SCOPE}`);
    if (hit) return hit;
    throw error;
  }
}

// Erster Besuch: Die Seite hat CanvasKit und Bundles schon geladen, bevor der Worker lief. Sie schickt
// die Liste, der Worker holt sie (meist aus dem HTTP-Cache) und legt sie ab.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'remember' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        data.urls
          .map((u) => new URL(u, self.location.href))
          .filter((url) => url.origin === self.location.origin && isImmutable(url))
          .map((url) =>
            cache.match(url.href).then((hit) => hit || cacheFirst(new Request(url.href)).catch(() => undefined)),
          ),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (isImmutable(url) && !request.headers.has('range')) {
    event.respondWith(cacheFirst(request));
  }
});
