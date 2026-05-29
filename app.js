/* Omniscience Intel - client logic. Buildless, no framework. */
(function () {
  "use strict";

  var CATS = ["geopolitics", "markets", "technology", "science"];
  var CAT_COLOR = { geopolitics: "#ffb000", markets: "#22d3ee", technology: "#2dd4bf", science: "#4ade80" };
  var PRIO_RADIUS = { critical: 11, high: 8, medium: 6, low: 4.5 };
  var PRIO_WEIGHT = { critical: 3, high: 2, medium: 1, low: 0 };
  var REGIONS = { world: [[-55, -170], [72, 178]], americas: [[-55, -130], [62, -34]], europe: [[35, -12], [62, 42]], meast: [[12, 25], [42, 63]], asia: [[-10, 60], [55, 150]], africa: [[-35, -20], [37, 52]] };
  var STALE_MS = 30 * 60 * 1000;
  var LS = { profile: "omni_profile_v1", reactions: "omni_reactions_v1", live: "omni_live_v1", meta: "omni_meta_v1", view: "omni_view_v1", fx: "omni_fx_v1" };
  var COUNTRIES_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  var seed = window.OMNI_SEED || { interests: [], stories: [] };
  var meta = loadJSON(LS.meta, { lastRefresh: null, liveOk: false });
  var state = {
    profile: loadProfile(),
    reactions: loadJSON(LS.reactions, {}),
    filters: new Set(CATS),
    search: "",
    interestedOnly: false,
    sort: "relevance",
    critOnly: false,
    fx: loadJSON("omni_fx_v1", !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)),
    showLinks: false,
    showTracks: false,
    trackTimer: null,
    selected: null,
    selectedCountry: null,
    navList: [],
    lastRefresh: meta.lastRefresh ? new Date(meta.lastRefresh) : null
  };
  var map = null, markerLayer = null, linkLayer = null, trackLayer = null, countryLayer = null, graticuleLayer = null, nightLayer = null, markerById = {};

  /* ---------- persistence ---------- */
  function loadJSON(key, fb) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fb : v; } catch (e) { return fb; } }
  function saveJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function loadProfile() {
    var p = loadJSON(LS.profile, null);
    if (!p) { p = { interests: (seed.interests || []).slice(), blocked: [] }; saveJSON(LS.profile, p); }
    if (!p.interests) p.interests = []; if (!p.blocked) p.blocked = [];
    return p;
  }
  function saveProfile() { saveJSON(LS.profile, state.profile); }
  function saveReactions() { saveJSON(LS.reactions, state.reactions); }
  function saveMeta() { saveJSON(LS.meta, { lastRefresh: state.lastRefresh ? state.lastRefresh.toISOString() : null, liveOk: meta.liveOk }); }

  /* ---------- data ---------- */
  function hashId(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return "L" + (h >>> 0).toString(36); }
  function normalizeStory(s) {
    var o = Object.assign({}, s);
    if (!o.id) o.id = hashId(o.title || Math.random().toString());
    o.category = (o.category || "geopolitics").toLowerCase();
    if (CATS.indexOf(o.category) === -1) o.category = "geopolitics";
    o.tags = (o.tags || []).map(String);
    o.priority = (o.priority || "medium").toLowerCase();
    o.lat = (o.lat == null || o.lat === "") ? NaN : Number(o.lat);
    o.lng = (o.lng == null || o.lng === "") ? NaN : Number(o.lng);
    return o;
  }
  function allStories() {
    var live = loadJSON(LS.live, []);
    var merged = (seed.stories || []).concat(live).map(normalizeStory).filter(function (s) { return isFinite(s.lat) && isFinite(s.lng); });
    var seen = {}, out = [];
    merged.forEach(function (s) { var k = (s.title || "").toLowerCase().trim(); if (!seen[k]) { seen[k] = 1; out.push(s); } });
    return out;
  }

  /* ---------- matching / scoring / visibility ---------- */
  function lc(a) { return String(a).toLowerCase(); }
  function tokenize(s) { return lc(s).split(/[^a-z0-9]+/).filter(function (t) { return t.length >= 2; }); }
  function reactionOf(s) { return state.reactions[s.id] || "none"; }
  function tagSetLc(s) { var set = {}; s.tags.forEach(function (t) { set[lc(t)] = 1; }); return set; }
  function interestTokens() { var set = {}; state.profile.interests.forEach(function (i) { tokenize(i).forEach(function (t) { set[t] = 1; }); }); return set; }
  function scoreWith(s, iTok) {
    var stoks = {}, sc = 0;
    [s.category].concat(s.tags).forEach(function (term) { tokenize(term).forEach(function (t) { stoks[t] = 1; }); });
    Object.keys(stoks).forEach(function (t) { if (iTok[t]) sc += 2; });
    if (reactionOf(s) === "interested") sc += 6;
    return sc + (PRIO_WEIGHT[s.priority] || 0);
  }
  function isBlocked(s) {
    if (reactionOf(s) === "blocked") return true;
    if (!state.profile.blocked.length) return false;
    var tags = tagSetLc(s);
    for (var i = 0; i < state.profile.blocked.length; i++) { if (tags[lc(state.profile.blocked[i])]) return true; }
    return false;
  }
  function searchMatch(s) {
    if (!state.search) return true;
    return (s.title + " " + s.summary + " " + (s.location_name || "") + " " + s.tags.join(" ")).toLowerCase().indexOf(state.search) !== -1;
  }
  function isVisible(s) {
    if (isBlocked(s) || !state.filters.has(s.category) || !searchMatch(s)) return false;
    if (state.interestedOnly && reactionOf(s) !== "interested") return false;
    if (state.critOnly && s.priority !== "critical") return false;
    return true;
  }
  function ranked() {
    var iTok = interestTokens();
    var byScore = function (a, b) { return scoreWith(b, iTok) - scoreWith(a, iTok); };
    var byPrio = function (a, b) { return (PRIO_WEIGHT[b.priority] || 0) - (PRIO_WEIGHT[a.priority] || 0); };
    var byDate = function (a, b) { return String(b.published_date || "").localeCompare(String(a.published_date || "")); };
    return allStories().slice().sort(function (a, b) {
      if (state.sort === "recent") return byDate(a, b) || byScore(a, b);
      if (state.sort === "priority") return byPrio(a, b) || byScore(a, b) || byDate(a, b);
      return byScore(a, b) || byPrio(a, b) || byDate(a, b);
    });
  }
  function visibleRanked() { return ranked().filter(isVisible); }

  /* ---------- map ---------- */
  function initMap() {
    if (typeof L === "undefined") { document.getElementById("map").innerHTML =
      '<div style="padding:24px;color:#5b7186">MAP UPLINK UNAVAILABLE (offline). Feed and dossier still operational.</div>'; return; }
    map = L.map("map", { zoomControl: true, attributionControl: true, worldCopyJump: true, minZoom: 2, maxZoom: 8, center: [25, 10], zoom: 2 });
    ["night:335", "graticule:340", "countries:350", "links:360", "tracks:650"].forEach(function (p) {
      var n = p.split(":")[0]; map.createPane(n); var pane = map.getPane(n); if (pane) { pane.style.zIndex = p.split(":")[1]; if (n !== "countries") pane.style.pointerEvents = "none"; }
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { subdomains: "abcd", maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
    drawGraticule(); drawNight(); setInterval(drawNight, 120000);
    linkLayer = L.layerGroup().addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    trackLayer = L.layerGroup().addTo(map);
    var v = loadJSON(LS.view, null);
    if (v && v.c) { try { map.setView(v.c, v.z); } catch (e) {} }
    map.on("moveend zoomend", function () { try { saveJSON(LS.view, { c: [map.getCenter().lat, map.getCenter().lng], z: map.getZoom() }); } catch (e) {} });
    loadCountries();
  }
  function drawGraticule() {
    if (!map || typeof L.polyline !== "function") return;
    if (!graticuleLayer) graticuleLayer = L.layerGroup().addTo(map);
    graticuleLayer.clearLayers();
    var i, o = function (z) { return { pane: "graticule", color: "#22d3ee", weight: z ? 0.8 : 0.4, opacity: z ? 0.28 : 0.1, interactive: false }; };
    for (i = -180; i <= 180; i += 30) L.polyline([[-85, i], [85, i]], o(i === 0)).addTo(graticuleLayer);
    for (i = -60; i <= 60; i += 30) L.polyline([[i, -180], [i, 180]], o(i === 0)).addTo(graticuleLayer);
  }
  function terminatorRing() {
    var rad = Math.PI / 180, jd = Date.now() / 86400000 + 2440587.5, T = (jd - 2451545) / 36525;
    var Ls = (280.46 + 36000.77 * T) % 360, g = (357.528 + 35999.05 * T) * rad;
    var lambda = (Ls + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, eps = (23.4393 - 0.013 * T) * rad;
    var decl = Math.asin(Math.sin(eps) * Math.sin(lambda)); if (Math.abs(decl) < 1e-6) decl = 1e-6;
    var GMST = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
    var RA = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / rad;
    var sub = ((RA - GMST + 540) % 360) - 180, pts = [], lon;
    for (lon = -180; lon <= 180; lon += 2) pts.push([Math.atan(-Math.cos((lon - sub) * rad) / Math.tan(decl)) / rad, lon]);
    var pole = decl > 0 ? -90 : 90; pts.push([pole, 180]); pts.push([pole, -180]);
    return pts;
  }
  function drawNight() {
    if (!map || typeof L.polygon !== "function") return;
    if (nightLayer) { try { map.removeLayer(nightLayer); } catch (e) {} nightLayer = null; }
    try { nightLayer = L.polygon(terminatorRing(), { pane: "night", stroke: false, fillColor: "#000010", fillOpacity: 0.34, interactive: false }).addTo(map); } catch (e) {}
  }
  function jitter(stories) {
    var groups = {};
    stories.forEach(function (s) { var k = s.lat.toFixed(1) + "," + s.lng.toFixed(1); (groups[k] = groups[k] || []).push(s); });
    var out = [];
    Object.keys(groups).forEach(function (k) {
      groups[k].forEach(function (s, i) {
        var c = Object.assign({}, s);
        if (groups[k].length > 1) { var a = (2 * Math.PI * i) / groups[k].length; c.lat += Math.sin(a) * 0.9; c.lng += Math.cos(a) * 0.9; }
        out.push(c);
      });
    });
    return out;
  }
  function renderMarkers() {
    if (!markerLayer) return;
    markerLayer.clearLayers(); markerById = {};
    jitter(visibleRanked()).forEach(function (s) {
      var color = CAT_COLOR[s.category] || "#22d3ee";
      var cls = "mk cat-" + s.category + (s.priority === "critical" ? " critical" : "");
      var m = L.circleMarker([s.lat, s.lng], { radius: PRIO_RADIUS[s.priority] || 6, color: color, weight: 2, fillColor: color, fillOpacity: 0.35, className: cls });
      m.on("click", function () { selectStory(s.id); });
      m.bindTooltip(s.title, { direction: "top", className: "mk-tip", opacity: 0.95 });
      m.addTo(markerLayer); markerById[s.id] = m;
    });
    highlightMarker(state.selected);
    var badge = document.getElementById("badgeCount"); if (badge) badge.textContent = visibleRanked().length;
    renderLinks();
  }
  function highlightMarker(id) {
    Object.keys(markerById).forEach(function (k) { var el = markerById[k].getElement && markerById[k].getElement(); if (el && el.classList) el.classList.toggle("sel", k === id); });
  }
  function renderLinks() {
    if (!linkLayer) return;
    linkLayer.clearLayers();
    if (!state.showLinks) return;
    var vis = visibleRanked(), lines = 0;
    for (var i = 0; i < vis.length && lines < 80; i++) {
      for (var j = i + 1; j < vis.length && lines < 80; j++) {
        var a = vis[i], b = vis[j];
        if (a.category === b.category || a.tags.some(function (t) { return b.tags.map(lc).indexOf(lc(t)) !== -1; })) {
          L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { pane: "links", color: CAT_COLOR[a.category] || "#22d3ee", weight: 0.6, opacity: 0.18 }).addTo(linkLayer);
          lines++;
        }
      }
    }
  }

  /* ---------- countries ---------- */
  function loadCountries() {
    if (typeof L === "undefined" || typeof window.fetch !== "function") return;
    fetch(COUNTRIES_URL).then(function (r) { return r.json(); }).then(function (topo) {
      var t = window.topojson; if (!t || !topo || !topo.objects || !topo.objects.countries) return;
      var geo = t.feature(topo, topo.objects.countries);
      countryLayer = L.geoJSON(geo, {
        pane: "countries",
        style: function () { return { color: "rgba(34,211,238,0.18)", weight: 0.6, fill: true, fillColor: "#0a1622", fillOpacity: 0.04 }; },
        onEachFeature: function (f, layer) {
          layer.on("mouseover", function () { if (state.selectedCountry !== name(f)) layer.setStyle({ fillOpacity: 0.16, color: "rgba(34,211,238,0.5)" }); });
          layer.on("mouseout", function () { if (state.selectedCountry !== name(f)) countryLayer.resetStyle(layer); });
          layer.on("click", function () { openCountry(f, layer); });
        }
      }).addTo(map);
    }).catch(function () {/* offline: map still works without clickable countries */});
  }
  function name(f) { return (f && f.properties && (f.properties.name || f.properties.NAME)) || "UNKNOWN"; }
  function pointInRing(lng, lat, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function pointInFeature(lat, lng, f) {
    var g = f && f.geometry; if (!g) return false;
    function inPoly(poly) { if (!poly.length || !pointInRing(lng, lat, poly[0])) return false; for (var k = 1; k < poly.length; k++) if (pointInRing(lng, lat, poly[k])) return false; return true; }
    if (g.type === "Polygon") return inPoly(g.coordinates);
    if (g.type === "MultiPolygon") { for (var m = 0; m < g.coordinates.length; m++) if (inPoly(g.coordinates[m])) return true; return false; }
    return false;
  }
  function storiesInFeature(f) { return ranked().filter(function (s) { return !isBlocked(s) && pointInFeature(s.lat, s.lng, f); }); }
  function openCountry(f, layer) {
    var cname = name(f); state.selectedCountry = cname;
    if (countryLayer) { countryLayer.resetStyle(); }
    if (layer) layer.setStyle({ color: "#ffb000", weight: 1.4, fillColor: "#1a1205", fillOpacity: 0.18 });
    closeDossier(true);
    var local = storiesInFeature(f);
    setText("cpName", cname.toUpperCase());
    setText("cpCount", local.length + " LOCAL");
    var list = document.getElementById("cpList"); list.innerHTML = "";
    local.forEach(function (s) { list.appendChild(countryCard(s)); });
    var live = document.createElement("div"); live.className = "cp-live muted"; live.id = "cpLive";
    live.textContent = "// scanning open sources for " + cname + "...";
    list.appendChild(live);
    var p = document.getElementById("countryPanel"); p.classList.add("open"); p.setAttribute("aria-hidden", "false");
    try { p.setAttribute("tabindex", "-1"); p.focus({ preventScroll: true }); } catch (e) {}
    fetchCountryNews(cname);
  }
  function countryCard(s) {
    var el = document.createElement("div");
    el.className = "cp-card"; el.style.setProperty("--c", CAT_COLOR[s.category]);
    el.innerHTML = '<div class="cp-card-cat">' + esc(s.category.toUpperCase()) + ' &middot; ' + esc(s.priority) + "</div>" +
      '<div class="cp-card-title">' + esc(s.title) + "</div>" +
      '<div class="cp-card-meta">' + esc(s.location_name || "") + "</div>";
    el.onclick = function () { selectStory(s.id); };
    return el;
  }
  function fetchCountryNews(cname) {
    if (typeof window.fetch !== "function") return;
    fetch("/api/news?country=" + encodeURIComponent(cname)).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (data) {
      var inc = (data && data.stories) || [];
      var liveEl = document.getElementById("cpLive"); if (!liveEl) return;
      if (!inc.length) { liveEl.textContent = (data && data.message) || "// no live source configured (set ANTHROPIC_API_KEY)"; return; }
      var cache = loadJSON(LS.live, []), seen = {}; cache.concat(seed.stories).forEach(function (s) { seen[lc(s.title)] = 1; });
      var added = [];
      inc.map(normalizeStory).forEach(function (s) { if (isFinite(s.lat) && isFinite(s.lng) && !seen[lc(s.title)]) { cache.push(s); seen[lc(s.title)] = 1; added.push(s); } });
      saveJSON(LS.live, cache);
      liveEl.textContent = "// LIVE: " + added.length + " fresh from open sources";
      var list = document.getElementById("cpList");
      added.forEach(function (s) { var c = countryCard(s); list.insertBefore(c, liveEl); });
      renderAll();
    }).catch(function () { var liveEl = document.getElementById("cpLive"); if (liveEl) liveEl.textContent = "// live uplink offline"; });
  }
  function closeCountry() {
    state.selectedCountry = null; if (countryLayer) countryLayer.resetStyle();
    var p = document.getElementById("countryPanel"); p.classList.remove("open"); p.setAttribute("aria-hidden", "true");
  }

  /* ---------- tracks (planes + tankers) ---------- */
  function toggleTracks() {
    state.showTracks = !state.showTracks;
    var btn = document.getElementById("tracksBtn"); btn.classList.toggle("on", state.showTracks); btn.setAttribute("aria-pressed", state.showTracks ? "true" : "false");
    if (state.trackTimer) { clearInterval(state.trackTimer); state.trackTimer = null; }
    if (!state.showTracks) { if (trackLayer) trackLayer.clearLayers(); btn.textContent = "▲ TRACKS"; return; }
    fetchTracks();
    state.trackTimer = setInterval(function () { if (state.showTracks) fetchTracks(); }, 25000);
  }
  function fetchTracks() {
    if (!trackLayer || typeof window.fetch !== "function") return;
    var btn = document.getElementById("tracksBtn"); btn.classList.add("busy");
    var qs = "";
    try { var b = map.getBounds(); qs = "?lamin=" + b.getSouth().toFixed(3) + "&lomin=" + b.getWest().toFixed(3) + "&lamax=" + b.getNorth().toFixed(3) + "&lomax=" + b.getEast().toFixed(3); } catch (e) {}
    fetch("/api/tracks" + qs).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { drawTracks(d); })
      .catch(function () { drawTracks(null); })
      .then(function () { btn.classList.remove("busy"); });
  }
  function drawTracks(d) {
    trackLayer.clearLayers();
    d = d || {};
    var planes = d.planes || [], tankers = d.tankers || [];
    planes.forEach(function (p) {
      if (typeof L.divIcon !== "function") return;
      var icon = L.divIcon({ className: "trk trk-plane", html: '<span style="transform:rotate(' + (p.heading || 0) + 'deg)">&#9650;</span>', iconSize: [16, 16] });
      L.marker([p.lat, p.lng], { icon: icon, pane: "tracks", interactive: true })
        .bindTooltip((p.callsign || "FLIGHT") + (p.alt ? " &middot; " + Math.round(p.alt) + "m" : ""), { className: "mk-tip" })
        .bindPopup("<b>" + esc(p.callsign || "FLIGHT") + "</b><br>AIRCRAFT<br>ALT " + Math.round(p.alt || 0) + " m<br>HDG " + Math.round(p.heading || 0) + "°", { className: "trk-pop" })
        .addTo(trackLayer);
    });
    tankers.forEach(function (t) {
      if (typeof L.divIcon !== "function") return;
      var icon = L.divIcon({ className: "trk trk-ship", html: "&#9632;", iconSize: [12, 12] });
      L.marker([t.lat, t.lng], { icon: icon, pane: "tracks", interactive: true })
        .bindTooltip("TANKER &middot; " + (t.name || "vessel") + (t.sample ? " (sample)" : ""), { className: "mk-tip" })
        .bindPopup("<b>" + esc(t.name || "vessel") + "</b><br>OIL TANKER" + (t.sample ? '<br><span style="color:#ffb000">SAMPLE POSITION</span>' : ""), { className: "trk-pop" })
        .addTo(trackLayer);
    });
    var n = planes.length + tankers.length, tbtn = document.getElementById("tracksBtn"); if (tbtn) tbtn.textContent = "▲ TRACKS (" + n + ")";
    toast("TACTICAL OVERLAY: " + planes.length + " aircraft, " + tankers.length + " tankers" + (d.planesLive ? "" : " (fallback)"), d.planesLive ? "" : "warn");
  }

  /* ---------- feed / filters / blocked / legend ---------- */
  function renderFeed() {
    var feed = document.getElementById("feed"); feed.innerHTML = "";
    var iTok = interestTokens(), list = visibleRanked();
    state.navList = list.map(function (s) { return s.id; });
    var maxScore = Math.max.apply(null, [1].concat(list.map(function (s) { return scoreWith(s, iTok); })));
    list.forEach(function (s, i) {
      var item = document.createElement("div");
      item.className = "feed-item" + (s.id === state.selected ? " active" : "") + (reactionOf(s) === "interested" ? " interested" : "");
      item.style.setProperty("--c", CAT_COLOR[s.category]);
      var prioCls = (s.priority === "critical" || s.priority === "high") ? " " + s.priority : "";
      var rel = Math.round((scoreWith(s, iTok) / maxScore) * 100);
      item.innerHTML =
        '<div class="feed-rank">' + String(i + 1).padStart(2, "0") + "</div>" +
        '<div><div class="feed-title">' + esc(s.title) + "</div>" +
        '<div class="feed-meta"><span class="feed-cat-dot"></span>' + esc(s.location_name || "") +
        ' <span class="feed-prio' + prioCls + '">' + esc(s.priority) + "</span>" +
        ' <span class="feed-age">' + esc(timeAgo(s.published_date)) + "</span>" +
        (reactionOf(s) === "interested" ? ' <span class="feed-flag">&#10003;</span>' : "") + "</div>" +
        '<div class="feed-bar" title="relevance ' + rel + '%"><span style="width:' + rel + '%"></span></div></div>';
      item.onclick = function () { selectStory(s.id); };
      feed.appendChild(item);
    });
    if (!list.length) feed.innerHTML = '<div class="muted" style="font-size:12px">NO CONTACTS MATCH ACTIVE FILTERS.</div>';
  }
  function renderFilters() {
    var box = document.getElementById("filters"); box.innerHTML = "";
    CATS.forEach(function (c) {
      var chip = document.createElement("div");
      chip.className = "chip" + (state.filters.has(c) ? " on" : ""); chip.textContent = c.toUpperCase();
      chip.onclick = function () { if (state.filters.has(c)) state.filters.delete(c); else state.filters.add(c); renderAll(); };
      box.appendChild(chip);
    });
    var crit = document.createElement("div");
    crit.className = "chip crit" + (state.critOnly ? " on" : ""); crit.textContent = "CRITICAL";
    crit.onclick = function () { state.critOnly = !state.critOnly; renderAll(); };
    box.appendChild(crit);
  }
  function renderBlocked() {
    var box = document.getElementById("blockedList"), bc = document.getElementById("blockedCount");
    box.innerHTML = ""; bc.textContent = state.profile.blocked.length;
    state.profile.blocked.forEach(function (t) {
      var tag = document.createElement("span"); tag.className = "blocked-tag"; tag.textContent = t; tag.title = "Click to un-suppress";
      tag.onclick = function () { state.profile.blocked = state.profile.blocked.filter(function (x) { return x !== t; }); saveProfile(); toast("RESTORED TOPIC: " + t); renderAll(); };
      box.appendChild(tag);
    });
    if (!state.profile.blocked.length) box.innerHTML = '<span class="muted" style="font-size:11px">none</span>';
  }
  function renderLegend() {
    var box = document.getElementById("legend"); if (!box) return;
    box.innerHTML = CATS.map(function (c) { return '<span class="lg"><span class="lg-dot" style="background:' + CAT_COLOR[c] + ';box-shadow:0 0 6px ' + CAT_COLOR[c] + '"></span>' + c.toUpperCase() + "</span>"; }).join("");
  }
  function renderBreakdown() {
    var box = document.getElementById("breakdown"); if (!box) return;
    var vis = visibleRanked(), counts = {}; CATS.forEach(function (c) { counts[c] = 0; });
    vis.forEach(function (s) { if (counts[s.category] != null) counts[s.category]++; });
    var max = Math.max.apply(null, [1].concat(CATS.map(function (c) { return counts[c]; })));
    box.innerHTML = CATS.map(function (c) {
      var w = Math.round((counts[c] / max) * 100);
      return '<div class="bd-row"><span class="bd-lab" style="color:' + CAT_COLOR[c] + '">' + ({ geopolitics: "GEO", markets: "MKT", technology: "TECH", science: "SCI" }[c] || c.toUpperCase()) +
        '</span><span class="bd-bar"><span style="width:' + w + "%;background:" + CAT_COLOR[c] + ';box-shadow:0 0 6px ' + CAT_COLOR[c] + '"></span></span><span class="bd-n">' + counts[c] + "</span></div>";
    }).join("");
  }
  function updateCounts() {
    var vis = visibleRanked(), flagged = allStories().filter(function (s) { return reactionOf(s) === "interested"; }).length;
    setText("countTotal", vis.length);
    setText("countPriority", vis.filter(function (s) { return s.priority === "critical" || s.priority === "high"; }).length);
    setText("countFlagged", flagged);
    setText("countBlocked", state.profile.blocked.length);
    setText("profileSummary", "PROFILE: " + state.profile.interests.length + " interest vectors / " + state.profile.blocked.length + " suppressed");
    var ib = document.getElementById("intelBtn"); if (ib) ib.classList.toggle("on", state.interestedOnly);
  }

  /* ---------- dossier ---------- */
  function selectStory(id) {
    state.selected = id; var s = byId(id); if (!s) return;
    closeCountry(); openDossier(s); highlightMarker(id); renderFeed();
    if (map) map.panTo([s.lat, s.lng], { animate: true });
    if (window.history && history.replaceState) { try { history.replaceState(null, "", "#s=" + id); } catch (e) {} }
  }
  function byId(id) { var a = allStories(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function openDossier(s) {
    var d = document.getElementById("dossier"); d.style.setProperty("--c", CAT_COLOR[s.category]);
    setText("dCat", "// " + s.category.toUpperCase()); setText("dTitle", s.title);
    setText("dLoc", s.location_name || "UNKNOWN"); setText("dCoords", s.lat.toFixed(3) + ", " + s.lng.toFixed(3));
    var srcEl = document.getElementById("dSource"); if (srcEl) { srcEl.textContent = (s.source || "SOURCE") + " ↗"; srcEl.href = srcUrl(s); }
    setText("dDate", (s.published_date || "") + (timeAgo(s.published_date) ? " · " + timeAgo(s.published_date) : ""));
    var pr = document.getElementById("dPriority"); pr.textContent = s.priority.toUpperCase(); pr.className = "prio " + s.priority;
    setText("dSummary", s.summary || "");
    var detail = document.getElementById("dDetail"); setText("dDetailText", s.detailed_intel || s.summary || "");
    var rxn = reactionOf(s); detail.hidden = rxn !== "interested";
    var tags = document.getElementById("dTags"); tags.innerHTML = "";
    s.tags.forEach(function (t) { var e = document.createElement("span"); e.className = "tag"; e.textContent = t; tags.appendChild(e); });
    setTristate(rxn); renderRelated(s);
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    try { d.setAttribute("tabindex", "-1"); d.focus({ preventScroll: true }); } catch (e) {}
  }
  function renderRelated(s) {
    var box = document.getElementById("dRelated"); if (!box) return;
    var tags = s.tags.map(lc);
    var rel = allStories().filter(function (o) { return o.id !== s.id && !isBlocked(o) && o.tags.some(function (t) { return tags.indexOf(lc(t)) !== -1; }); }).slice(0, 4);
    box.innerHTML = rel.length ? '<div class="related-head">// RELATED INTEL</div>' : "";
    rel.forEach(function (o) {
      var el = document.createElement("div"); el.className = "related-item"; el.style.setProperty("--c", CAT_COLOR[o.category]);
      el.textContent = o.title; el.onclick = function () { selectStory(o.id); };
      box.appendChild(el);
    });
  }
  function closeDossier(keepCountry) {
    var d = document.getElementById("dossier"); d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
    state.selected = null; highlightMarker(null); if (!keepCountry) renderFeed();
    if (!keepCountry && window.history && history.replaceState) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  }
  function setTristate(rxn) { document.querySelectorAll("#tristate .tri").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-state") === rxn); }); }

  /* ---------- reactions ---------- */
  function setReaction(next) {
    var s = byId(state.selected); if (!s) return;
    if (next === "interested") { state.reactions[s.id] = "interested"; addUnique(state.profile.interests, [s.category].concat(s.tags)); document.getElementById("dDetail").hidden = false; toast("INTEL EXPANDED. TOPIC BOOSTED: " + s.category); }
    else if (next === "blocked") { state.reactions[s.id] = "blocked"; addUnique(state.profile.blocked, s.tags); toast("SUPPRESSED: " + (s.tags.join(", ") || s.category), "bad"); }
    else { delete state.reactions[s.id]; var own = s.tags.map(lc); state.profile.blocked = state.profile.blocked.filter(function (b) { return own.indexOf(lc(b)) === -1; }); document.getElementById("dDetail").hidden = true; toast("ASSESSMENT CLEARED"); }
    saveReactions(); saveProfile(); setTristate(reactionOf(s));
    if (next === "blocked") closeDossier();
    renderAll();
  }
  function addUnique(arr, items) { var have = arr.map(lc); items.forEach(function (it) { if (have.indexOf(lc(it)) === -1) { arr.push(it); have.push(lc(it)); } }); }
  function resetProfile() {
    state.profile = { interests: (seed.interests || []).slice(), blocked: [] }; state.reactions = {};
    state.filters = new Set(CATS); state.search = ""; state.interestedOnly = false;
    var si = document.getElementById("feedSearch"); if (si) si.value = "";
    saveProfile(); saveReactions(); closeDossier(); toast("PROFILE RESET TO BASELINE"); renderAll();
  }
  function applyFx() { document.body.classList.toggle("no-fx", !state.fx); }
  function toggleHelp(force) {
    var o = document.getElementById("helpOverlay"); if (!o) return;
    var open = force === undefined ? !o.classList.contains("open") : force;
    o.classList.toggle("open", open); o.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) { var hc = document.getElementById("helpClose"); try { if (hc) hc.focus({ preventScroll: true }); } catch (e) {} }
  }
  function exportProfile() {
    try {
      var data = JSON.stringify({ profile: state.profile, reactions: state.reactions, exported: new Date().toISOString() }, null, 2);
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      a.download = "omniscience-profile.json"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast("PROFILE EXPORTED");
    } catch (e) { toast("EXPORT FAILED", "bad"); }
  }
  function importProfile(file) {
    if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var o = JSON.parse(rd.result);
        if (o.profile && Array.isArray(o.profile.interests)) state.profile = { interests: o.profile.interests, blocked: o.profile.blocked || [] };
        if (o.reactions && typeof o.reactions === "object") state.reactions = o.reactions;
        saveProfile(); saveReactions(); closeDossier(); renderAll(); toast("PROFILE IMPORTED");
      } catch (e) { toast("IMPORT FAILED: bad file", "bad"); }
    };
    rd.readAsText(file);
  }

  /* ---------- live refresh ---------- */
  function refresh(silent) {
    var btn = document.getElementById("refreshBtn"); btn.classList.add("busy"); setLive("ACQUIRING", true);
    fetch("/api/news?blocked=" + encodeURIComponent(state.profile.blocked.join(",")), { headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        var inc = (data && data.stories) || [];
        if (inc.length) {
          var cache = loadJSON(LS.live, []), seen = {}; cache.concat(seed.stories).forEach(function (s) { seen[lc(s.title)] = 1; });
          var added = 0; inc.map(normalizeStory).forEach(function (s) { if (isFinite(s.lat) && isFinite(s.lng) && !seen[lc(s.title)]) { cache.push(s); seen[lc(s.title)] = 1; added++; } });
          saveJSON(LS.live, cache); meta.liveOk = true; toast("LIVE SYNC: +" + added + " new contacts");
        } else if (!silent) { toast((data && data.message) || "NO LIVE SOURCE CONFIGURED. SHOWING CACHED INTEL.", "warn"); }
      })
      .catch(function () { if (!silent) toast("LIVE UPLINK OFFLINE. SHOWING CACHED INTEL.", "warn"); })
      .then(function () { state.lastRefresh = new Date(); saveMeta(); stamp(); btn.classList.remove("busy"); setLive("LIVE", false); renderAll(); });
  }
  function setLive(label, busy) { setText("liveLabel", label); var el = document.querySelector(".stat.live"); if (el) el.style.color = busy ? "#ffb000" : "#4ade80"; }
  function stamp() { setText("lastRefresh", state.lastRefresh ? hhmm(state.lastRefresh) + "Z" : "SEED"); }

  /* ---------- keyboard nav ---------- */
  function navMove(delta) {
    if (!state.navList.length) return;
    var cur = state.navList.indexOf(state.selected);
    var next = cur === -1 ? 0 : Math.max(0, Math.min(state.navList.length - 1, cur + delta));
    selectStory(state.navList[next]);
    var active = document.querySelector(".feed-item.active"); if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  }

  /* ---------- utils ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function setText(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function hhmm(d) { return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); }
  function timeAgo(ds) { if (!ds) return ""; var d = new Date(ds + "T00:00:00Z"); if (isNaN(d.getTime())) return ds; var days = Math.round((Date.now() - d.getTime()) / 86400000); if (days <= 0) return "today"; if (days === 1) return "1d ago"; if (days < 30) return days + "d ago"; if (days < 365) return Math.round(days / 30) + "mo ago"; return ds; }
  function srcUrl(s) { return s.url || s.source_url || ("https://news.google.com/search?q=" + encodeURIComponent(s.title)); }
  function clockTick() { var d = new Date(); setText("clock", pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds())); }
  var toastTimer = null;
  function toast(msg, kind) { var t = document.getElementById("toast"); t.className = "toast show" + (kind ? " " + kind : ""); t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "toast"; }, 3200); }

  function renderAll() { renderFeed(); renderFilters(); renderBlocked(); renderBreakdown(); updateCounts(); renderMarkers(); }

  function wire() {
    document.getElementById("refreshBtn").onclick = function () { refresh(false); };
    document.getElementById("dossierClose").onclick = function () { closeDossier(); };
    var cpc = document.getElementById("cpClose"); if (cpc) cpc.onclick = closeCountry;
    var si = document.getElementById("feedSearch"); if (si) si.oninput = function () { state.search = si.value.trim().toLowerCase(); renderFeed(); renderMarkers(); updateCounts(); };
    var rb = document.getElementById("resetBtn"); if (rb) rb.onclick = resetProfile;
    var lb = document.getElementById("linksBtn"); if (lb) lb.onclick = function () { state.showLinks = !state.showLinks; lb.classList.toggle("on", state.showLinks); lb.setAttribute("aria-pressed", state.showLinks ? "true" : "false"); renderLinks(); };
    var tb = document.getElementById("tracksBtn"); if (tb) tb.onclick = toggleTracks;
    var ib = document.getElementById("intelBtn"); if (ib) ib.onclick = function () { state.interestedOnly = !state.interestedOnly; ib.setAttribute("aria-pressed", state.interestedOnly ? "true" : "false"); renderAll(); };
    var fx = document.getElementById("fxBtn"); if (fx) fx.onclick = function () { state.fx = !state.fx; applyFx(); saveJSON(LS.fx, state.fx); fx.classList.toggle("on", state.fx); fx.setAttribute("aria-pressed", state.fx ? "true" : "false"); };
    var hb = document.getElementById("helpBtn"); if (hb) hb.onclick = function () { toggleHelp(); };
    var hc = document.getElementById("helpClose"); if (hc) hc.onclick = function () { toggleHelp(false); };
    var eb = document.getElementById("exportBtn"); if (eb) eb.onclick = exportProfile;
    var imb = document.getElementById("importBtn"), imf = document.getElementById("importFile");
    if (imb && imf) { imb.onclick = function () { imf.click(); }; imf.onchange = function () { importProfile(imf.files && imf.files[0]); }; }
    var rt = document.getElementById("railToggle"); if (rt) rt.onclick = function () { document.body.classList.toggle("rail-open"); };
    var rj = document.getElementById("regionJump"); if (rj) rj.onchange = function () { var b = REGIONS[rj.value]; if (b && map) { try { map.fitBounds(b); } catch (e) {} } };
    document.querySelectorAll(".srt").forEach(function (b) { b.onclick = function () { state.sort = b.getAttribute("data-sort"); document.querySelectorAll(".srt").forEach(function (x) { x.classList.toggle("on", x === b); }); renderAll(); }; });
    document.querySelectorAll("#tristate .tri").forEach(function (b) { b.onclick = function () { setReaction(b.getAttribute("data-state")); }; });
    document.addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "Escape") { closeDossier(); closeCountry(); toggleHelp(false); }
      else if (e.key === "?") { e.preventDefault(); toggleHelp(); }
      else if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); navMove(1); }
      else if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); navMove(-1); }
    });
  }

  function boot() {
    var lines = ["ESTABLISHING UPLINK...", "DECRYPTING FEEDS...", "PLOTTING CONTACTS...", "OMNISCIENCE ONLINE"], i = 0, bl = document.getElementById("bootLine");
    var iv = setInterval(function () { i++; if (bl && lines[i]) bl.textContent = lines[i]; }, 320);
    setTimeout(function () { clearInterval(iv); var b = document.getElementById("boot"); if (b) b.classList.add("hidden"); }, 1400);
  }

  function init() {
    initMap(); wire(); renderLegend(); applyFx(); clockTick(); setInterval(clockTick, 1000); stamp(); renderAll(); boot();
    var hm = (location.hash.match(/s=([\w-]+)/) || [])[1]; if (hm && byId(hm)) selectStory(hm);
    if (meta.liveOk && state.lastRefresh && (Date.now() - state.lastRefresh.getTime() > STALE_MS)) refresh(true);
    if ("serviceWorker" in navigator) { try { navigator.serviceWorker.register("sw.js").catch(function () {}); } catch (e) {} }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.OMNI = { state: state, ranked: ranked, visibleRanked: visibleRanked, isVisible: isVisible, isBlocked: isBlocked, pointInFeature: pointInFeature, storiesInFeature: storiesInFeature, scoreOf: function (s) { return scoreWith(s, interestTokens()); }, navMove: navMove, allStories: allStories };
})();
