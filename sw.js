/* Omniscience Intel service worker. Network-first for same-origin GETs (always
 * fresh when online), with a cached app-shell fallback for offline. Live data
 * (/api/*) and cross-origin requests (tiles, CDN libs) always go to the network. */
var CACHE = "omni-shell-v2";
var SHELL = ["./", "index.html", "app.js", "styles.css", "data.js", "icon.svg", "manifest.json"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.indexOf("/api/") === 0) return;
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match("index.html"); }); })
  );
});
