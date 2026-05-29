/*
 * Tactical tracking endpoint for Omniscience Intel (Vercel serverless).
 *
 * Planes: live from the free OpenSky Network API (no key; anonymous is rate
 *   limited, so failures fall back to a small sample). Optional OPENSKY_USER /
 *   OPENSKY_PASS env raises limits.
 * Tankers: representative SAMPLE positions at major chokepoints. Real global
 *   AIS needs a keyed feed; wire one here (e.g. AISSTREAM_API_KEY) to go live.
 */
const SAMPLE_PLANES = [
  [40.64, -73.78, 90], [51.47, -0.45, 270], [25.25, 55.36, 120], [35.55, 139.78, 200],
  [33.94, -118.4, 300], [1.36, 103.99, 45], [50.03, 8.57, 180], [-23.43, -46.47, 350],
  [-26.13, 28.24, 60], [-33.95, 151.18, 15], [19.07, 72.87, 270], [55.97, 37.41, 90]
].map((p, i) => ({ lat: p[0], lng: p[1], heading: p[2], callsign: "FLT" + (100 + i), alt: 9000 + i * 200 }));

const SAMPLE_TANKERS = [
  [26.57, 56.25, "VLCC HORMUZ STAR"], [1.43, 102.9, "MT MALACCA"], [30.0, 32.55, "MT SUEZ CROWN"],
  [35.95, -5.6, "MT GIBRALTAR"], [9.0, -79.5, "MT PANAMA SPIRIT"], [41.1, 29.05, "MT BOSPHORUS"],
  [25.12, 56.34, "MT FUJAIRAH"], [1.26, 103.8, "MT SINGAPORE"], [51.95, 4.07, "MT ROTTERDAM"],
  [29.6, -94.9, "MT HOUSTON"], [26.64, 50.16, "MT RAS TANURA"], [29.87, 121.55, "MT NINGBO"]
].map((t, i) => ({ lat: t[0], lng: t[1], name: t[2], sample: true }));

module.exports = async function handler(req, res) {
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  const planes = await getPlanes(req.query || {});
  return res.status(200).end(JSON.stringify({
    planes: planes.list, planesLive: planes.live,
    tankers: SAMPLE_TANKERS, tankersLive: false,
    note: planes.live ? "planes live via OpenSky; tankers are sample positions" : "planes + tankers are sample positions (live feed unavailable)"
  }));
};

async function getPlanes(q) {
  let url = "https://opensky-network.org/api/states/all";
  const f = ["lamin", "lomin", "lamax", "lomax"].map(k => parseFloat(q[k]));
  if (f.every(isFinite) && f[0] < f[2] && f[1] < f[3]) {
    url += "?lamin=" + f[0] + "&lomin=" + f[1] + "&lamax=" + f[2] + "&lomax=" + f[3];
  }
  const headers = {};
  if (process.env.OPENSKY_USER && process.env.OPENSKY_PASS) {
    headers.Authorization = "Basic " + Buffer.from(process.env.OPENSKY_USER + ":" + process.env.OPENSKY_PASS).toString("base64");
  }
  try {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(to);
    if (!r.ok) return { list: SAMPLE_PLANES, live: false };
    const data = await r.json();
    const states = (data && data.states) || [];
    const mapped = states
      .filter(s => Number.isFinite(s[6]) && Number.isFinite(s[5]) && !s[8])
      .map(s => ({ lat: s[6], lng: s[5], heading: s[10] || 0, callsign: (s[1] || "").trim() || "UNKNOWN", alt: s[7] || 0 }));
    if (!mapped.length) return { list: SAMPLE_PLANES, live: false };
    const cap = 2000, step = Math.max(1, Math.floor(mapped.length / cap));
    const sampled = []; for (let i = 0; i < mapped.length && sampled.length < cap; i += step) sampled.push(mapped[i]);
    return { list: sampled, live: true };
  } catch (e) {
    return { list: SAMPLE_PLANES, live: false };
  }
};
