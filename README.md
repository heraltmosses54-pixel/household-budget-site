# Dompet Keluarga — Santoso Family Budget

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/heraltmosses54-pixel/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/heraltmosses54-pixel/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site for one Indonesian family — the Santosos of Magelang.
It runs entirely offline from static files, on desktop and on a phone.

## What it does

- **Dashboard** — November 2026 at a glance: income vs spending vs saved,
  a spending donut, budget health, recent transactions and savings goals.
- **Transactions** — every rupiah in and out, with filters by category,
  plus add / edit / delete. Totals everywhere update at once.
- **Budgets** — a monthly limit per category with progress bars and
  over-budget warnings; change any limit and the bars move.
- **Goals** — emergency fund, new fridge, family trip to Dieng, with
  contributions and a finish date at the family's saving pace.
- **Reports** — income vs spending for the last 6 months, spending by
  category, and plain-language insights (biggest spend, over-budget
  categories, savings-rate trend).

All figures are real Rupiah from the family's own October and November 2026
records. Data is kept in the browser (localStorage) — nothing leaves the device.

## Files

- `app/index.html` — the shell: top bar, nav, footer.
- `app/style.css` — all styling, including the phone layout.
- `app/data.js` — seeded household data and the state layer (totals, budgets, trends).
- `app/charts.js` — SVG charts, drawn by hand: donut, month bars, category bars.
- `app/views.js` — one render function per page.
- `app/app.js` — hash router, forms and event wiring.
- `main.ts` — the hand-in program (copies `app/` + `screenshots/`, writes `dossier.json`).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
- `screenshots/` — 4 desktop renders of the site running (Dashboard, Transactions, Bills, Reports).

## Run it

```sh
node main.ts   # writes out/ (or set MAKEFUN_OUTPUT_DIR)
```

Or serve `app/` with any static server and open `index.html`.
