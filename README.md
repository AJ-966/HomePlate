# HomePlate

Home-cooked meals for university students. A React frontend for CS4032 Assignment 02.
All orders, payments and cancellations are **simulated**; there is no backend.

**Student:** 24i-2137
**GitHub:**  | **Deployment:**  | **Final commit:** 

## Commands

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # production build into dist/
npm test        # runs: node --test
```

## Project layout

```
src/
  components/   reusable UI pieces
  pages/        one file per route
  data/         config constants, meals data, async mock loader
  rules/        business-rule functions (pure, testable)
  lib/          pricing, discovery (search/filter/sort), storage, demo settings
  hooks/        custom hooks
  context/      shared order state
  styles/       authored CSS
tests/          Node test runner tests for the business rule
```

## Status

Milestone 2 (routes, layout, home, browse with search/cuisine/price/sort filters, meal cards,
meal details, loading/error/empty/not-found states) is complete. Ordering, rules, tests and
deployment notes come in later milestones. This README will be completed before submission.

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/meals` | Browse and filter meals |
| `/meals/:id` | Meal details (unknown ids show a helpful not-found state) |
| `*` | Not found |

## Design

Fonts: Caprasimo (headings) and Bricolage Grotesque (body), self-hosted via Fontsource.
Palette: mint tile, aubergine ink, persimmon, marigold and spearmint (see `src/styles/tokens.css`).
