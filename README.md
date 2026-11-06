<p align="center">
  <img src="public/icona.png" alt="Sisyphum logo" width="112" />
</p>

<h1 align="center">Sisyphum</h1>

<p align="center">
  A personal study planner for university students: a weekly calendar that turns a
  course programme into concrete daily sessions — calm, flexible, and fully offline.
</p>

<p align="center">
  <strong>Live:</strong> <a href="https://sisyphum.netlify.app">sisyphum.netlify.app</a> · English · <a href="README.it.md">Italiano</a>
</p>

## Why I built this

I started Sisyphum during a particularly stressful semester, with lectures, deadlines
and too many university commitments to balance at once. My real problem was not
deciding *what* to study, but turning a long list of subjects and deadlines into a
concrete plan for each day — and the uncertainty about what to do next only made the
stress worse.

Every planner I tried never quite fit. Some were generic habit trackers, some were
blank-canvas tools that asked me to build my own system first, others were rigid
schedulers that treated a skipped session as a failure and piled the missed hours onto
the following days. None of them matched the way I actually study: long focused blocks,
flexible breaks, and a plan I stay in control of.

So I built the tool I wanted: a calm study calendar that shows what to do today, makes
the plan easy to change, and keeps track of what was done — without pressure.

## About the name

My brother always teases me for being a bit like Sisyphus: once I get fixated on
something, I keep pushing the same boulder up the hill, again and again. At some point
I decided to take it as a compliment.

*Sisyphum* is the Latin accusative of *Sisyphus*, the object of an unspoken verb:
*[I follow] Sisyphus*. Studying is a daily, repeated effort — and, as Camus put it,
"one must imagine Sisyphus happy". The app is built around that idea: an unfinished day
is not a failure, there are no punitive streaks, and every morning you simply start again.

## Features

- **Interactive weekly calendar** — create blocks by dragging, move and resize them,
  duplicate, with touch gestures tuned for iPad
- **Today view** — the day's sessions at a glance; mark each one done, partial or skipped
  with a single tap
- **Planned vs. done** — skipped sessions stay visible and can be rescheduled manually;
  nothing is moved automatically
- **Copy previous week** — with duplicate and overlap detection
- **Subjects** — colours, exam dates, priorities, weekly hour targets, archiving
- **Ambient / Focus atmosphere** — an animated night sky (asynchronous stars, a distant
  planet, slow orbits) that freezes and dims in Focus mode
- **Local-first** — data lives in IndexedDB on the device; JSON backup export/import
- **Installable PWA** — works offline on Windows and iPad

## Tech stack

React · TypeScript · Vite · Tailwind CSS · FullCalendar · Dexie (IndexedDB) ·
date-fns · vite-plugin-pwa

## Architecture notes

- No backend and no login: each device keeps its own database. Records carry UUIDs and
  `updatedAt` timestamps to keep a future sync layer possible.
- Week copying runs inside a single transaction and re-computes its plan there, so
  repeated clicks can never create duplicates.
- Date arithmetic uses calendar days (not 24-hour multiples) to stay correct across
  daylight-saving changes.

## Running locally

```bash
npm install
npm run dev      # development server
npm run build    # type-check + production build
npm run preview  # preview the production build (PWA enabled)
```
