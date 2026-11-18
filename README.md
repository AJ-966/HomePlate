# HomePlate

Home-cooked meals for university students. A React frontend for CS4032 Assignment 02.
All orders, payments and cancellations are **simulated**; there is no backend.

**Student:** TODO (name, roll number, section)
**GitHub:** TODO | **Deployment:** TODO | **Final commit:** TODO

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

Milestone 3 (order state, the three business rules, order review, delivery form, confirmation) is
complete. Layout polish, the running fee bar and cancellation come in milestones 4 and 5. This README will be
completed before submission.

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/meals` | Browse and filter meals |
| `/meals/:id` | Meal details (unknown ids show a helpful not-found state) |
| `/order` | Review the order, change quantities, pick delivery zone, see all costs |
| `/checkout` | Delivery form and slot choice |
| `/confirmation` | Last placed order |
| `*` | Not found |

## Design

Fonts: Caprasimo (headings) and Bricolage Grotesque (body), self-hosted via Fontsource.
Palette: mint tile, aubergine ink, persimmon, marigold and spearmint (see `src/styles/tokens.css`).

## Business rules (pure functions in `src/rules` and `src/lib`)

| Rule | File | Tested in |
|---|---|---|
| Quantity: max 4 per meal, never above stock | `src/rules/quantityRule.js` | `tests/rules.test.js` |
| Dietary suitability, per meal and per order | `src/rules/dietaryRule.js` | `tests/rules.test.js` |
| Delivery slots: 3 hours' notice, 11:00 to 21:00, cancel by 2 hours before | `src/rules/slotRule.js` | `tests/rules.test.js` |
| Cost totals | `src/lib/pricing.js` | `tests/rules.test.js` |

Run the tests with `npm test`.
