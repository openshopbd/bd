// অফলাইন-ফার্স্ট সার্ভিস ওয়ার্কার: সাইটের সব ফাইল, ফন্ট, ফায়ারবেস লাইব্রেরি ও প্রোডাক্ট ছবি ফোনে জমা রাখে।
// প্রথমবার নেট থাকা অবস্থায় খুললে পরে নেট চলে গেলেও সাইট খুলবে ও প্রোডাক্ট দেখা যাবে।
const CACHE_NAME = 'openshop-cache-v14';
const CORE = ['./', 'index.html', 'products.js', 'firebase-config.js', 'bd-locations.js', 'manifest.json',
  'images/logo.png', 'images/hero-banner.jpg', 'images/icon-192.png', 'images/icon-512.png'];
const CDN = ['https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla:wght@400&display=swap'];
const IMG_RE = /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i;
const SKIP_HOST = /google-analytics|googletagmanager|doubleclick|firestore\.googleapis|firebaseio/i;

async function put(cache, url, cors) {
  try {
    const res = await fetch(url, cors ? { mode: 'cors', credentials: 'omit' } : undefined);
    if (res && res.ok) await cache.put(url, res);
  } catch (e) { /* বাদ */ }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urls = new Set(CORE);
    try { // index.html-এ যত ফাইলের লিংক আছে (style.css?v=.., script.js?v=..) সব নিজে থেকে খুঁজে নেয়
      const html = await (await fetch('index.html', { cache: 'no-cache' })).text();
      for (const m of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) urls.add(m[1]);
    } catch (e) { /* বাদ */ }
    await Promise.all([...urls].map(u => put(cache, u, false)));
    await Promise.all(CDN.map(u => put(cache, u, true)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

function withTimeout(ms, p) {
  return new Promise((ok, no) => { const t = setTimeout(() => no(new Error('timeout')), ms); p.then(v => { clearTimeout(t); ok(v); }, e => { clearTimeout(t); no(e); }); });
}

async function networkFirst(req, isNav) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await withTimeout(4000, fetch(req));
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req)) || (isNav ? (await cache.match('index.html')) || (await cache.match('./')) : null)
      || (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
    if (res && res.ok) { cache.put(req.url, res.clone()); return res; }
  } catch (e) { /* CORS না থাকলে নিচে সাধারণ ফেচ */ }
  return fetch(req);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url; try { url = new URL(req.url); } catch (e) { return; }
  if (SKIP_HOST.test(url.hostname)) return;
  if (url.origin === self.location.origin) {
    event.respondWith(IMG_RE.test(url.pathname) ? cacheFirst(req) : networkFirst(req, req.mode === 'navigate'));
  } else if (req.destination === 'image' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
      || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))) {
    event.respondWith(cacheFirst(req));
  }
});

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'PRECACHE_IMAGES' || !Array.isArray(event.data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const queue = event.data.urls.filter(u => /^https?:/.test(u));
    const worker = async () => {
      while (queue.length) {
        const u = queue.shift();
        try {
          if (await cache.match(u)) continue;
          await put(cache, u, new URL(u).origin !== self.location.origin);
        } catch (e) { /* বাদ */ }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  })());
});
