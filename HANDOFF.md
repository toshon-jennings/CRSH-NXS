# HANDOFF — crsh-nexus

## Objective
CRSH-NXS: central registry / federation directory for city crash-risk engines
(forks of PHLCRSH-V2). Static React + Vite site, deployed to GitHub Pages at
base `/CRSH-NXS/`.

## Current state (2026-07-03)
UI design overhaul complete — replaced the generic SaaS-dashboard look with a
road-infrastructure design language:

- **Type:** Barlow Condensed (display, highway-sign lettering), Overpass
  (body, FHWA Highway Gothic digitization), Overpass Mono (data/labels).
- **Palette:** asphalt darks / thermoplastic-white text / retroreflective sign
  yellow `#FFC61E` accent; guide-sign green = online, stop-sign red =
  offline/KSI. Light theme is a "DOT plan sheet" concrete/paper look.
- **Signature motif:** dashed yellow road centerline — header bottom, footer
  top, modal head, map connection lines, and the deployment-route step
  connector (steps numbered in warning-diamond markers).
- All tokens live in `src/index.css` (`:root` light / `:root.dark` dark).
  No component library; plain CSS classes prefixed `nexus-`.

Functionality unchanged: localStorage node registry + theme, registration
modal, search/status filters, SVG federation map.

## Tasks
- [x] Redesign tokens, type system, and all components (src/index.css)
- [x] Restructure stats strip, cards, steps, modal markup (src/App.jsx)
- [x] Verify dark/light themes, mobile (375px), modal + registration flow
- [ ] Commit + version bump + push (triggers Pages deploy) — awaiting Toshon
- [ ] Optional: favicon/logo refresh to match the sign-yellow identity

## Notes / blind spots
- `vite.config.js` now honors `PORT` env (falls back to 5180); dev port 5180
  can be occupied by another local service — Vite auto-increments.
- Dev preview served at `http://localhost:<port>/CRSH-NXS/` (note the base path).
