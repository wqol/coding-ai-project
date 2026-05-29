# Omniscience Intel

A personalized world-news intelligence map. Top stories render as glowing markers
at their real geographic location on a dark tactical world map (Black Ops /
Palantir Gotham vibe). Each story carries a tri-state control that drives an
evolving personalization profile stored in your browser.

Standalone static app: HTML + CSS + vanilla JS with Leaflet for the map. No build
step and no backend required. An optional serverless endpoint adds live,
web-grounded refresh. (Originally prototyped on the Base44 builder, then
reimplemented here as a self-contained app so it runs without Base44.)

## Run locally

Any static server works, for example:

    python3 -m http.server 8099
    # then open http://localhost:8099

Map tiles and fonts load from CDNs, so the browser needs internet. The 19 seed
stories are bundled in `data.js` and work offline.

## Deploy (Vercel)

Push to the repo. Vercel serves the static root and the `/api` function
automatically, no config needed. This repo is already wired to Vercel, so each
push redeploys the preview.

## Live refresh (optional)

By default, REFRESH FEED runs on the bundled dataset and reports "no live source
configured". To enable live, web-grounded news:

- Set `ANTHROPIC_API_KEY` in the Vercel project env (optionally `OMNI_MODEL`).
- `api/news.js` then uses Claude with the web-search tool to return current,
  geolocated stories as JSON; the app merges them in (additive, deduped by title,
  blocked topics skipped).

Live AI output should be sanity-checked. For hard sourcing, swap `api/news.js` for
a real news API and geocode results there.

## Features

- World-map command center: dark CARTO basemap, cyan lat/long grid, scanlines,
  corner brackets. Markers are colored by category (geopolitics amber, markets
  cyan, technology teal, science green) and sized/pulsing by priority; overlapping
  markers are jittered.
- Dossier panel on marker or feed click: title, coordinates, source, date,
  summary, tags, and the tri-state control.
- Tri-state per story: NONE; MORE INTEL (tick) expands `detailed_intel` and boosts
  the topic; SUPPRESS (cross) hides it and blocks the topic.
- Personalization: ranks and filters against your interest profile, removes
  blocked topics, keeps a PRIORITY FEED rail synced with the map, category
  filters, and a suppressed-topics list with one-click restore.
- State persists in `localStorage` (profile, per-story reactions, live cache).

## Files

- `index.html`, `styles.css`, `app.js`
- `data.js` - bundled stories + seed interest profile
- `api/news.js` - optional live endpoint (safe fallback when no key set)

## Data model (per story)

`title`, `summary`, `detailed_intel`, `category` (geopolitics|markets|technology|
science), `source`, `location_name`, `lat`, `lng`, `priority`
(critical|high|medium|low), `tags[]`, `published_date`.

## Personalization seed

Seeded from the user's supplied profile: quant finance and markets, AI/ML and big
tech, physics and space science, startups, geopolitics, plus personal niches.
The original "use memory and read all my chats" was not possible (no accessible
chat history), so the profile is seeded directly and refined by the tick/cross
learning loop.

## Known limitations

- Map tiles and fonts need network on the browser side; story data is bundled.
- Live AI refresh can surface current-sounding but unverified specifics; a real
  news API is the recommended path for hard sourcing.
- Personalization is single-user and local (localStorage), not multi-device.
