# Omniscience Intel

A personalized world-news intelligence map, built on Base44. Top news stories
render as glowing markers placed at their real geographic location on a dark
tactical world map (Black Ops / Palantir Gotham aesthetic). Each story carries a
tri-state control that drives an evolving personalization profile.

- App ID: `6a198e95e95a7f343578de72`
- Editor / preview: https://app.base44.com/apps/6a198e95e95a7f343578de72/editor/preview
- Owner account: jameseagle2323@gmail.com

This repo does not hold the app source. The app is built and hosted on Base44 and
edited through the Base44 editor (the AI builder owns the codegen). This file is
the design record and operating notes.

## What it does

- World map command center. Full-screen near-black world map, faint cyan lat/long
  grid, scanline and vignette overlays. Each story is a glowing marker at its
  coordinates, colored by category (geopolitics amber, markets cyan, technology
  teal, science green) and sized/glowing by priority, with critical stories
  pulsing. Overlapping markers are jittered.
- Dossier panel. Clicking a marker slides in a dossier with corner brackets and a
  classification-style header: title, coordinates, source, published date, summary,
  and the tri-state control.
- Tri-state control (per story):
  - NONE: default, no signal.
  - MORE INTEL (tick): marks interested, expands the dossier to the longer
    `detailed_intel`, and appends the story's category and tags to the user's
    interests.
  - SUPPRESS (cross): hides the story and adds its category and tags to
    `blacklisted_topics` so that topic never appears again.
- Personalization. Stories are filtered against `blacklisted_topics` and ranked by
  how well their category and tags match the interests list. Higher-relevance and
  higher-priority stories get larger, brighter markers and sit at the top of the
  PRIORITY FEED rail. Coverage stays broad; personalization changes emphasis and
  ordering.
- Live news. A REFRESH FEED control pulls current top stories via Base44's
  internet-grounded LLM across geopolitics, markets/finance, AI/technology, and
  science/space, skips blacklisted topics, geolocates each story, and saves them.
  Auto-refreshes on load when data is older than 30 minutes. Refresh is additive
  and de-dupes by title (it does not wipe the feed or reacted stories).

## Data model (Base44 entities)

- `NewsStory`: title, summary, detailed_intel, category, source, location_name,
  latitude, longitude, priority (critical/high/medium/low), status
  (unread/acknowledged/flagged/dismissed), tags[], published_date, image_url.
  `flagged` = MORE INTEL, `dismissed` = SUPPRESS.
- `UserPreference` (one per user): interests[], blacklisted_topics[], last_refresh.
  The evolving personalization memory.
- `User`: built-in Base44 user (role).

## Personalization seed

Personalization was originally requested as "use memory and look at all chats."
No chat history is accessible in the build environment, so the interest profile was
seeded directly from the user's supplied profile and refined by the tri-state
learning loop. Seed interests span quant finance and markets, AI/ML and big tech,
physics and particle/quantum science, startups and founders, geopolitics, plus
personal niches (powerlifting, chess). Copy is kept terse and ASCII.

## How it was built

1. `create_base44_app` with the verbatim request (Base44 named it "Omniscience Intel").
2. Seeded `UserPreference` (interest profile) and an initial set of real, current,
   geolocated `NewsStory` records pulled from live web search.
3. Edit 1: tri-state control semantics, personalization ranking, live news refresh.
4. Edit 2: tactical command-center theme, map markers, dossier panel, loading state.
5. Edit 3: single-preference merge + additive (non-destructive) refresh.

## Known limitations / next steps

- LLM-grounded news can surface current-sounding but unverified specifics. For
  reliable sourcing, wire a real news API (e.g. via a Base44 backend function) and
  treat the LLM only for geolocation/summarization.
- Single-user assumption. Designed as a personal feed; multi-user would need
  per-user `UserPreference` scoping verified end to end.
- Reaction history lives on the story record; persistent learning lives in
  `UserPreference` (survives refresh). Consider a dedicated reaction log if you want
  per-story history independent of the story set.
