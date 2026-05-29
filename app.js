/* Omniscience Intel - client logic. Buildless, no framework. */
(function () {
  "use strict";

  var CATS = ["geopolitics", "markets", "technology", "science"];
  var CAT_COLOR = { geopolitics: "#ffb000", markets: "#22d3ee", technology: "#2dd4bf", science: "#4ade80" };
  var PRIO_RADIUS = { critical: 11, high: 8, medium: 6, low: 4.5 };
  var PRIO_WEIGHT = { critical: 3, high: 2, medium: 1, low: 0 };
  var LS = { profile: "omni_profile_v1", reactions: "omni_reactions_v1", live: "omni_live_v1" };

  var seed = window.OMNI_SEED || { interests: [], stories: [] };
  var state = {
    profile: loadProfile(),
    reactions: loadJSON(LS.reactions, {}),
    filters: new Set(CATS),
    search: "",
    selected: null,
    lastRefresh: null
  };
  var map = null, markerLayer = null, markerById = {};

  /* ---------- persistence ---------- */
  function loadJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function loadProfile() {
    var p = loadJSON(LS.profile, null);
    if (!p) { p = { interests: (seed.interests || []).slice(), blocked: [] }; saveJSON(LS.profile, p); }
    if (!p.interests) p.interests = [];
    if (!p.blocked) p.blocked = [];
    return p;
  }
  function saveProfile() { saveJSON(LS.profile, state.profile); }
  function saveReactions() { saveJSON(LS.reactions, state.reactions); }

  /* ---------- data ---------- */
  function hashId(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return "L" + (h >>> 0).toString(36); }
  function normalizeStory(s) {
    var o = Object.assign({}, s);
    if (!o.id) o.id = hashId(o.title || Math.random().toString());
    o.category = (o.category || "geopolitics").toLowerCase();
    if (CATS.indexOf(o.category) === -1) o.category = "geopolitics";
    o.tags = (o.tags || []).map(function (t) { return String(t); });
    o.priority = (o.priority || "medium").toLowerCase();
    o.lat = Number(o.lat); o.lng = Number(o.lng);
    return o;
  }
  function allStories() {
    var live = loadJSON(LS.live, []);
    var merged = (seed.stories || []).concat(live).map(normalizeStory)
      .filter(function (s) { return isFinite(s.lat) && isFinite(s.lng); });
    var seen = {}, out = [];
    merged.forEach(function (s) { var k = (s.title || "").toLowerCase().trim(); if (!seen[k]) { seen[k] = 1; out.push(s); } });
    return out;
  }

  /* ---------- matching / scoring / visibility ---------- */
  function lc(a) { return String(a).toLowerCase(); }
  function tokenize(s) { return lc(s).split(/[^a-z0-9]+/).filter(function (t) { return t.length >= 2; }); }
  function reactionOf(s) { return state.reactions[s.id] || "none"; }
  function tagSetLc(s) { var set = {}; s.tags.forEach(function (t) { set[lc(t)] = 1; }); return set; }

  function interestTokens() {
    var set = {};
    state.profile.interests.forEach(function (i) { tokenize(i).forEach(function (t) { set[t] = 1; }); });
    return set;
  }
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
    var tags = tagSetLc(s);                       // EXACT tag match (no substring, no category)
    for (var i = 0; i < state.profile.blocked.length; i++) { if (tags[lc(state.profile.blocked[i])]) return true; }
    return false;
  }
  function searchMatch(s) {
    if (!state.search) return true;
    return (s.title + " " + s.summary + " " + (s.location_name || "") + " " + s.tags.join(" ")).toLowerCase().indexOf(state.search) !== -1;
  }
  function isVisible(s) { return !isBlocked(s) && state.filters.has(s.category) && searchMatch(s); }
  function ranked() {
    var iTok = interestTokens();
    return allStories().slice().sort(function (a, b) {
      var d = scoreWith(b, iTok) - scoreWith(a, iTok); if (d) return d;
      var pd = (PRIO_WEIGHT[b.priority] || 0) - (PRIO_WEIGHT[a.priority] || 0); if (pd) return pd;
      return String(b.published_date || "").localeCompare(String(a.published_date || ""));
    });
  }

  /* ---------- map ---------- */
  function initMap() {
    if (typeof L === "undefined") { document.getElementById("map").innerHTML =
      '<div style="padding:24px;color:#5b7186">MAP UPLINK UNAVAILABLE (offline). Feed and dossier still operational.</div>'; return; }
    map = L.map("map", { zoomControl: true, attributionControl: true, worldCopyJump: true,
      minZoom: 2, maxZoom: 7, center: [25, 10], zoom: 2 });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }
  function jitter(stories) {
    var groups = {};
    stories.forEach(function (s) { var k = s.lat.toFixed(1) + "," + s.lng.toFixed(1); (groups[k] = groups[k] || []).push(s); });
    var out = [];
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (s, i) {
        var c = Object.assign({}, s);
        if (g.length > 1) { var ang = (2 * Math.PI * i) / g.length, r = 0.9; c.lat += Math.sin(ang) * r; c.lng += Math.cos(ang) * r; }
        out.push(c);
      });
    });
    return out;
  }
  function renderMarkers() {
    if (!markerLayer) return;
    markerLayer.clearLayers(); markerById = {};
    var vis = jitter(ranked().filter(isVisible));
    vis.forEach(function (s) {
      var color = CAT_COLOR[s.category] || "#22d3ee";
      var cls = "mk cat-" + s.category + (s.priority === "critical" ? " critical" : "");
      var m = L.circleMarker([s.lat, s.lng], { radius: PRIO_RADIUS[s.priority] || 6, color: color, weight: 2, fillColor: color, fillOpacity: 0.35, className: cls });
      m.on("click", function () { selectStory(s.id); });
      m.bindTooltip(s.title, { direction: "top", className: "mk-tip", opacity: 0.95 });
      m.addTo(markerLayer); markerById[s.id] = m;
    });
    highlightMarker(state.selected);
    var badge = document.getElementById("badgeCount"); if (badge) badge.textContent = vis.length;
  }
  function highlightMarker(id) {
    Object.keys(markerById).forEach(function (k) {
      var m = markerById[k], el = m.getElement && m.getElement();
      if (el && el.classList) el.classList.toggle("sel", k === id);
    });
  }

  /* ---------- feed / filters / blocked / legend ---------- */
  function renderFeed() {
    var feed = document.getElementById("feed"); feed.innerHTML = "";
    var list = ranked().filter(isVisible);
    list.forEach(function (s, i) {
      var item = document.createElement("div");
      item.className = "feed-item" + (s.id === state.selected ? " active" : "") + (reactionOf(s) === "interested" ? " interested" : "");
      item.style.setProperty("--c", CAT_COLOR[s.category]);
      var prioCls = (s.priority === "critical" || s.priority === "high") ? " " + s.priority : "";
      item.innerHTML =
        '<div class="feed-rank">' + String(i + 1).padStart(2, "0") + "</div>" +
        '<div><div class="feed-title">' + esc(s.title) + "</div>" +
        '<div class="feed-meta"><span class="feed-cat-dot"></span>' + esc(s.location_name || "") +
        ' <span class="feed-prio' + prioCls + '">' + esc(s.priority) + "</span>" +
        (reactionOf(s) === "interested" ? ' <span class="feed-flag">&#10003;</span>' : "") + "</div></div>";
      item.onclick = function () { selectStory(s.id); };
      feed.appendChild(item);
    });
    if (!list.length) feed.innerHTML = '<div class="muted" style="font-size:12px">NO CONTACTS MATCH ACTIVE FILTERS.</div>';
  }
  function renderFilters() {
    var box = document.getElementById("filters"); box.innerHTML = "";
    CATS.forEach(function (c) {
      var chip = document.createElement("div");
      chip.className = "chip" + (state.filters.has(c) ? " on" : "");
      chip.textContent = c.toUpperCase();
      chip.onclick = function () { if (state.filters.has(c)) state.filters.delete(c); else state.filters.add(c); renderAll(); };
      box.appendChild(chip);
    });
  }
  function renderBlocked() {
    var box = document.getElementById("blockedList"), bc = document.getElementById("blockedCount");
    box.innerHTML = ""; bc.textContent = state.profile.blocked.length;
    state.profile.blocked.forEach(function (t) {
      var tag = document.createElement("span");
      tag.className = "blocked-tag"; tag.textContent = t; tag.title = "Click to un-suppress";
      tag.onclick = function () {
        state.profile.blocked = state.profile.blocked.filter(function (x) { return x !== t; });
        saveProfile(); toast("RESTORED TOPIC: " + t); renderAll();
      };
      box.appendChild(tag);
    });
    if (!state.profile.blocked.length) box.innerHTML = '<span class="muted" style="font-size:11px">none</span>';
  }
  function renderLegend() {
    var box = document.getElementById("legend"); if (!box) return;
    box.innerHTML = CATS.map(function (c) {
      return '<span class="lg"><span class="lg-dot" style="background:' + CAT_COLOR[c] + ';box-shadow:0 0 6px ' + CAT_COLOR[c] + '"></span>' + c.toUpperCase() + "</span>";
    }).join("");
  }
  function updateCounts() {
    var vis = ranked().filter(isVisible);
    document.getElementById("countTotal").textContent = vis.length;
    document.getElementById("countPriority").textContent = vis.filter(function (s) { return s.priority === "critical" || s.priority === "high"; }).length;
    document.getElementById("countBlocked").textContent = state.profile.blocked.length;
    document.getElementById("profileSummary").textContent =
      "PROFILE: " + state.profile.interests.length + " interest vectors / " + state.profile.blocked.length + " suppressed";
  }

  /* ---------- dossier ---------- */
  function selectStory(id) {
    state.selected = id; var s = byId(id); if (!s) return;
    openDossier(s); highlightMarker(id); renderFeed();
    if (map) map.panTo([s.lat, s.lng], { animate: true });
  }
  function byId(id) { var a = allStories(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function openDossier(s) {
    var d = document.getElementById("dossier");
    d.style.setProperty("--c", CAT_COLOR[s.category]);
    setText("dCat", "// " + s.category.toUpperCase());
    setText("dTitle", s.title);
    setText("dLoc", s.location_name || "UNKNOWN");
    setText("dCoords", s.lat.toFixed(3) + ", " + s.lng.toFixed(3));
    setText("dSource", s.source || "");
    setText("dDate", s.published_date || "");
    var pr = document.getElementById("dPriority"); pr.textContent = s.priority.toUpperCase(); pr.className = "prio " + s.priority;
    setText("dSummary", s.summary || "");
    var detail = document.getElementById("dDetail");
    setText("dDetailText", s.detailed_intel || s.summary || "");
    var rxn = reactionOf(s);
    detail.hidden = rxn !== "interested";
    var tags = document.getElementById("dTags"); tags.innerHTML = "";
    s.tags.forEach(function (t) { var e = document.createElement("span"); e.className = "tag"; e.textContent = t; tags.appendChild(e); });
    setTristate(rxn);
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
  }
  function closeDossier() {
    var d = document.getElementById("dossier"); d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
    state.selected = null; highlightMarker(null); renderFeed();
  }
  function setTristate(rxn) {
    document.querySelectorAll("#tristate .tri").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-state") === rxn); });
  }

  /* ---------- reactions (the learning loop) ---------- */
  function setReaction(next) {
    var s = byId(state.selected); if (!s) return;
    if (next === "interested") {
      state.reactions[s.id] = "interested";
      addUnique(state.profile.interests, [s.category].concat(s.tags));   // boost topic
      document.getElementById("dDetail").hidden = false;
      toast("INTEL EXPANDED. TOPIC BOOSTED: " + s.category);
    } else if (next === "blocked") {
      state.reactions[s.id] = "blocked";
      addUnique(state.profile.blocked, s.tags);                          // suppress specific tags, not the whole category
      toast("SUPPRESSED: " + (s.tags.join(", ") || s.category), "bad");
    } else {
      delete state.reactions[s.id];
      var own = s.tags.map(lc);
      state.profile.blocked = state.profile.blocked.filter(function (b) { return own.indexOf(lc(b)) === -1; });
      document.getElementById("dDetail").hidden = true;
      toast("ASSESSMENT CLEARED");
    }
    saveReactions(); saveProfile(); setTristate(reactionOf(s));
    if (next === "blocked") closeDossier();
    renderAll();
  }
  function addUnique(arr, items) {
    var have = arr.map(lc);
    items.forEach(function (it) { if (have.indexOf(lc(it)) === -1) { arr.push(it); have.push(lc(it)); } });
  }
  function resetProfile() {
    state.profile = { interests: (seed.interests || []).slice(), blocked: [] };
    state.reactions = {};
    state.filters = new Set(CATS);
    state.search = ""; var si = document.getElementById("feedSearch"); if (si) si.value = "";
    saveProfile(); saveReactions();
    closeDossier(); toast("PROFILE RESET TO BASELINE"); renderAll();
  }

  /* ---------- live refresh ---------- */
  function refresh() {
    var btn = document.getElementById("refreshBtn");
    btn.classList.add("busy"); setLive("ACQUIRING", true);
    var bl = state.profile.blocked.join(",");
    fetch("/api/news?blocked=" + encodeURIComponent(bl), { headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        var incoming = (data && data.stories) || [];
        if (incoming.length) {
          var cache = loadJSON(LS.live, []), seen = {};
          cache.concat(seed.stories).forEach(function (s) { seen[lc(s.title)] = 1; });
          var added = 0;
          incoming.map(normalizeStory).forEach(function (s) {
            if (isFinite(s.lat) && isFinite(s.lng) && !seen[lc(s.title)]) { cache.push(s); seen[lc(s.title)] = 1; added++; }
          });
          saveJSON(LS.live, cache);
          toast("LIVE SYNC: +" + added + " new contacts");
        } else { toast((data && data.message) || "NO LIVE SOURCE CONFIGURED. SHOWING CACHED INTEL.", "warn"); }
      })
      .catch(function () { toast("LIVE UPLINK OFFLINE. SHOWING CACHED INTEL.", "warn"); })
      .then(function () { state.lastRefresh = new Date(); stamp(); btn.classList.remove("busy"); setLive("LIVE", false); renderAll(); });
  }
  function setLive(label, busy) {
    document.getElementById("liveLabel").textContent = label;
    document.querySelector(".stat.live").style.color = busy ? "#ffb000" : "#4ade80";
  }
  function stamp() { document.getElementById("lastRefresh").textContent = state.lastRefresh ? hhmm(state.lastRefresh) + "Z" : "SEED"; }

  /* ---------- utils / chrome ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function setText(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function hhmm(d) { return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); }
  function clockTick() { var d = new Date(); setText("clock", pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds())); }
  var toastTimer = null;
  function toast(msg, kind) {
    var t = document.getElementById("toast");
    t.className = "toast show" + (kind ? " " + kind : ""); t.textContent = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "toast"; }, 3200);
  }

  function renderAll() { renderFeed(); renderFilters(); renderBlocked(); updateCounts(); renderMarkers(); }

  function wire() {
    document.getElementById("refreshBtn").onclick = refresh;
    document.getElementById("dossierClose").onclick = closeDossier;
    var si = document.getElementById("feedSearch");
    if (si) si.oninput = function () { state.search = si.value.trim().toLowerCase(); renderFeed(); renderMarkers(); updateCounts(); };
    var rb = document.getElementById("resetBtn"); if (rb) rb.onclick = resetProfile;
    document.querySelectorAll("#tristate .tri").forEach(function (b) { b.onclick = function () { setReaction(b.getAttribute("data-state")); }; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDossier(); });
  }

  function boot() {
    var lines = ["ESTABLISHING UPLINK...", "DECRYPTING FEEDS...", "PLOTTING CONTACTS...", "OMNISCIENCE ONLINE"];
    var i = 0, bl = document.getElementById("bootLine");
    var iv = setInterval(function () { i++; if (bl && lines[i]) bl.textContent = lines[i]; }, 320);
    setTimeout(function () { clearInterval(iv); var b = document.getElementById("boot"); if (b) b.classList.add("hidden"); }, 1400);
  }

  function init() {
    initMap(); wire(); renderLegend(); clockTick(); setInterval(clockTick, 1000); stamp(); renderAll(); boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
