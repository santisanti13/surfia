# SurfIA — Encuentra olas allá donde estés

> Alertas inteligentes de surf con IA. No esperes a mirar el forecast — SurfIA te avisa cuando hay olas cerca.

**Live:** [surfiaa.com](https://surfiaa.com)

---

## The problem

Most surfers miss good sessions not because the waves aren't there, but because they weren't paying attention to the forecast. Existing apps require you to actively check conditions — SurfIA flips that: **it tells you when to go, not the other way around.**

---

## What it does

SurfIA monitors surf conditions in real time using the AEMET API and sends smart alerts when wave height, wind, and swell direction match the user's preferences for their saved spots.

- **Smart alerts** — AI-generated summaries of surf conditions ("1.2m waves with 10s period, light offshore wind — good session at your local break")
- **Spot discovery** — find surf spots near your location or anywhere in Spain
- **Real-time forecast** — wave height, wind speed and direction, swell period
- **PWA-ready** — installable on mobile, designed for use on the beach

---

## Architecture

```
User → SurfIA Web App (React + Supabase)
              │
              ├── Auth & DB → Supabase (PostgreSQL + RLS)
              │
              ├── Forecast → AEMET API (wave height, wind, swell)
              │
              └── Alert engine → AI-generated condition summaries
                                 triggered by user-defined thresholds
```

The alert engine evaluates incoming forecast data against each user's
saved spots and preferences, then generates a natural-language summary
of conditions — so instead of reading raw numbers, users get a plain
message that tells them whether it's worth paddling out.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth |
| Forecast data | AEMET API |
| Mobile | Capacitor (iOS/Android wrapper) |
| Deployment | Lovable + custom domain `surfiaa.com` |

---

## Key features

### Proactive alerts
Unlike traditional forecast apps, SurfIA pushes conditions to you.
The alert system evaluates wave height, wind speed, swell period and
direction against user-configured thresholds — and fires when conditions
are right, rather than waiting for you to check.

### AI-generated condition summaries
Raw forecast numbers (Hs: 1.2m, Tp: 10s, Dir: 290°) are translated
into plain language by an AI layer: *"Clean 1m waves with a long period
and light offshore wind — worth going out if you're intermediate or above."*

### Spot management
Users can save and name their local breaks, set per-spot preferences
(minimum wave height, acceptable wind directions), and get alerts
tailored to each spot independently.

### PWA + Capacitor
The app is installable as a PWA and wrapped with Capacitor for native
iOS/Android distribution — same codebase, three surfaces.

---

## Roadmap

- [ ] Migrate forecast source from AEMET to [Open-Meteo Marine API](https://marine-api.open-meteo.com) for richer swell data (period, direction, secondary swell)
- [ ] Native push notifications via Capacitor (replacing in-app alerts)
- [ ] Community-sourced spot database (user reports, photos, difficulty ratings)
- [ ] Session logging — track your sessions and correlate with forecast accuracy
- [ ] Tide integration

---

## Why this exists

Spain has hundreds of surf spots, many of them under-documented on
mainstream apps. And the surfers who use them are often working, travelling,
or away from their home break — they need to be told when conditions are
right, not reminded to check an app they've already forgotten about.

SurfIA is a personal project born from that frustration. It's also an
exploration of what proactive, AI-assisted tooling looks like for a
consumer use case — the same "don't make me look, tell me when" pattern
that powers good B2B monitoring tools, applied to something people
actually love.

---

## Local development

```bash
git clone https://github.com/santisanti13/surfia.git
cd surfia
npm install
npm run dev
```

Requires a Supabase project and an AEMET API key. Copy `.env.example`
to `.env` and fill in your credentials.

---

## Author

Built by **Santi** — SaaS builder, EdTech & GovTech.
[santiagojimenezvalero.com](https://www.santiagojimenezvalero.com) · [LinkedIn](https://www.linkedin.com/in/santijiménezvalero)
