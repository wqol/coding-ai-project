/*
 * Optional live-news endpoint for Omniscience Intel (Vercel serverless).
 *
 * Default (no key): returns a safe fallback so the app keeps working on the
 * bundled dataset and the UI shows "no live source configured".
 *
 * Enable live, web-grounded refresh by setting ANTHROPIC_API_KEY in the Vercel
 * project env. Optionally set OMNI_MODEL (defaults to a current Claude model).
 * The model runs real web searches and returns geolocated stories as JSON.
 */
const MODEL = process.env.OMNI_MODEL || "claude-sonnet-4-6";
const CATS = ["geopolitics", "markets", "technology", "science"];
const PRIOS = ["critical", "high", "medium", "low"];

module.exports = async function handler(req, res) {
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(200).end(JSON.stringify({
      stories: [], fallback: true,
      message: "No live source configured. Set ANTHROPIC_API_KEY in Vercel to enable live refresh."
    }));
  }

  const blocked = String((req.query && req.query.blocked) || "").split(",").map(s => s.trim()).filter(Boolean);
  const country = String((req.query && req.query.country) || "").trim().slice(0, 60);
  const scope = country
    ? "the TOP CURRENT real-world news happening in or about " + country + " right now. Return up to 8. Every lat/lng must be inside " + country + "."
    : "the TOP CURRENT real-world news stories right now across these categories: geopolitics, markets, technology, science. Return the 12 most important.";
  const prompt =
    "Use web search to find " + scope +
    (blocked.length ? " EXCLUDE anything about these blocked topics: " + blocked.join(", ") + "." : "") +
    " Output ONLY a JSON array, no prose. Each item must be: " +
    '{"title": string, "summary": string (max 160 chars), "detailed_intel": string (2-3 sentences), ' +
    '"category": one of geopolitics|markets|technology|science, "source": string, ' +
    '"location_name": string, "lat": number, "lng": number, ' +
    '"priority": one of critical|high|medium|low, "tags": string[], "published_date": "YYYY-MM-DD"}. ' +
    "lat/lng must be the real geographic location the story is about. JSON array only.";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(200).end(JSON.stringify({ stories: [], fallback: true, message: "live fetch failed: " + r.status + " " + t.slice(0, 180) }));
    }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    const stories = sanitize(extractJsonArray(text));
    return res.status(200).end(JSON.stringify({ stories, fallback: stories.length === 0, source: "anthropic/web_search" }));
  } catch (e) {
    return res.status(200).end(JSON.stringify({ stories: [], fallback: true, message: "live fetch error: " + String(e).slice(0, 180) }));
  }
};

function extractJsonArray(text) {
  if (!text) return [];
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { return JSON.parse(m[0]); } catch (e) { return []; }
}

function sanitize(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => ({
    title: String(s.title || "").slice(0, 200),
    summary: String(s.summary || "").slice(0, 240),
    detailed_intel: String(s.detailed_intel || s.summary || "").slice(0, 800),
    category: CATS.includes(String(s.category || "").toLowerCase()) ? String(s.category).toLowerCase() : "geopolitics",
    source: String(s.source || "live"),
    location_name: String(s.location_name || ""),
    lat: s.lat == null ? NaN : Number(s.lat), lng: s.lng == null ? NaN : Number(s.lng),
    priority: PRIOS.includes(String(s.priority || "").toLowerCase()) ? String(s.priority).toLowerCase() : "medium",
    tags: Array.isArray(s.tags) ? s.tags.map(String).slice(0, 10) : [],
    published_date: String(s.published_date || new Date().toISOString().slice(0, 10))
  })).filter(s => s.title && Number.isFinite(s.lat) && Number.isFinite(s.lng));
}
