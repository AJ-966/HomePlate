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

Milestone 1 (setup and business data) is complete. Routes, components, rules, tests and
deployment notes will be added as the project progresses. This README will be completed
before submission (routes, features, edge-case reproduction, limitations, concept map).
