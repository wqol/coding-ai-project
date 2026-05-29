# Omniscience Intel

A personalized world-news intelligence map with a dark tactical command-center UI
(Black Ops / Palantir Gotham vibe). Top stories render as glowing markers at their
real location; each has a tri-state control (none / more intel / suppress) that
drives an evolving, browser-stored personalization profile.

Self-contained static app (HTML + CSS + vanilla JS + Leaflet), no build step.

## Quick start

    python3 -m http.server 8099
    # open http://localhost:8099

## Deploy

Push the repo; Vercel serves the static root and the optional `/api/news` function
with no config.

See `OMNISCIENCE_INTEL.md` for full docs, features, the optional live-refresh setup
(`ANTHROPIC_API_KEY`), and known limitations.
