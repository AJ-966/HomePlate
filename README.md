# HomePlate

Home-cooked meals for university students: browse meals cooked by neighbours, see exactly what a portion is and
what it costs (fees included), order for a delivery slot, and cancel for free until two hours before it.
A React frontend for CS4032 Assignment 02. All orders, payments, cooks and deliveries are **simulated** - there is
no backend.

**Student:** 24i-2137, CY-A | **GitHub:** TODO | **Deployment:** TODO | **Final commit:** TODO

## Commands

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build into dist/
npm run preview # serve the production build locally
npm test        # runs: node --test
```

Test result at the last check: 18 tests, 18 passing (`tests/rules.test.js`).

## Routes

| Path | Page |
|---|---|
| `/` | Home: how it works, cuisines, featured meals |
| `/meals` | Browse: search, cuisine, dietary needs, USD price range, sort |
| `/meals/:id` | Meal details with portion facts. An unknown id shows a helpful not-found state |
| `/order` | Basket: change quantities, pick delivery zone, see every cost |
| `/checkout` | Delivery details form and slot choice |
| `/orders` | All orders placed on this device: booked, cancelled, completed |
| `/orders/:id` | One order, with the cancel control and live countdown |
| `/credits` | Photo credits |
| `*` | Not found |

## Features

- Browse 12 meals with search, cuisine chips, dietary needs, price range in dollars and sorting. Filters survive
  opening a meal and pressing Back. Dietary needs are saved on the device.
- Every meal states its real portion (grams cooked, what one portion equals, allergens, cook). (Decision D2)
- A running total with fees included appears once the first meal is added. (Decision D1)
- Quantity limits, dietary checks and delivery-slot rules (below).
- A validated delivery form. Details can be remembered on this device and deleted by unticking the box.
- Orders are saved; each shows its status and a Cancel button with a live countdown. (Decision D3)
- Loading, error, empty, not-found and sold-out states throughout.
- Keyboard and screen reader support: skip link, visible focus, labelled fields, error summary that takes focus.

## Operating rules

| Rule | Behaviour | File |
|---|---|---|
| Quantity (the rule covered by the automated test) | At most 4 of one meal per order, never more than the cook has left today | `src/rules/quantityRule.js` |
| Dietary | A meal fits only if it meets every need selected. An order with a meal that doesn't fit cannot be placed | `src/rules/dietaryRule.js` |
| Slots | One-hour slots from 11:00 to 21:00, today and tomorrow, starting at least 3 hours from now. Free cancellation ends 2 hours before the slot | `src/rules/slotRule.js` |
| Cost | Meals + delivery fee for the zone + service fee. An empty basket costs nothing | `src/lib/pricing.js` |

All limits and fees are constants in `src/data/config.js`.

## Reproducing edge cases

Open **Demo controls (for markers)** at the bottom of any page. It only changes this browser.

| Case | Steps | Expected |
|---|---|---|
| Menu fails to load | Demo controls, tick "Make the menu fail to load" | Error message with a Try again button; untick and press Try again to recover |
| Meal sells out | Add Chana Masala to the basket. Demo controls, choose it, set 0, Apply | Card shows "Sold out today"; the basket removes it and says so |
| Stock drops after an order | Order 2 of a meal, then open the menu. Cancel the order | Stock shown falls by 2, then returns when cancelled |
| Less stock than selected | Add 4 Pad Thai. Demo controls, set Pad Thai to 2 | Quantity drops to 2 with a notice in the basket |
| Corrupted saved data | DevTools console: `localStorage.setItem('homeplate.order','{bad')`, reload | App starts with an empty basket and no error |
| Slot becomes too soon | Choose a slot on `/checkout`, then Demo controls "+2 h", then Place order | "That slot is no longer available", slot cleared |
| Cancellation window closes | Open a booked order, Demo controls "+2 h" | Countdown ends, Cancel is disabled with the reason |
| Order completed | Demo controls "+1 day" on `/orders` | Order moves to Earlier orders as Completed |
| Unknown meal, order, page | Visit `/meals/m99`, `/orders/HP-ZZZZZ`, `/nowhere` | Helpful not-found pages |
| Dietary conflict | Tick Nut-free, add Pad Thai, go to `/checkout` | Order blocked, meal named, link to edit |
| Invalid price range | Min 12, max 8 | Message, filter ignored |
| Empty basket and orders | Visit `/checkout`, `/orders` with nothing saved | Explanatory empty states |

## Simulated operations and known limitations

- Payments, cooks, delivery and cancellation are simulated; nothing is charged or delivered.
- There are no accounts or login. Orders, details and preferences are stored in this browser (localStorage) only,
  so they do not follow the student to another device and are lost if browser data is cleared.
- Stock is reduced by orders placed on this device only (no shared backend), so another browser sees full stock.
- Slot times use the device's local time zone. The demo clock can move time forward only.
- Photos are illustrative Unsplash images, not the made-up cooks' dishes. The plate drawing is the fallback.
- Prices are in US dollars only.

## Project layout

```
src/
  components/   reusable UI pieces
  pages/        one file per route
  data/         config constants, meals, credits, async mock loader
  rules/        business rules (pure, testable)
  lib/          pricing, discovery, validation, orders, time, clock, storage, demo settings
  hooks/        useNow, useCountdown, useDocumentTitle
  context/      meals, preferences, filters, order state
  styles/       authored CSS (tokens, base, components)
public/meals/   meal photos
tests/          node:test file for the rules
DECISIONS.md    the three frontend decisions
```

## Deployment

The app uses client-side routing, so the host must serve `index.html` for every path.
- **Vercel:** import the repository (framework: Vite). `vercel.json` already contains the rewrite.
- **Netlify:** `public/_redirects` is copied into `dist/` and contains the rewrite.
- Build command `npm run build`, output directory `dist`.

After deploying, check: the public link opens without sign-in, photos load, the main journey works (browse,
add, basket, checkout, place order, cancel), and refreshing `/meals/m04` and `/orders` works.

## Concept map

| Concept | Where | What |
|---|---|---|
| Routing, route params | `src/App.jsx`, `src/pages/MealDetails.jsx`, `OrderDetail.jsx` | `Routes`, `Route`, `useParams` |
| `useState`, lazy initial state | `src/context/OrderContext.jsx`, `src/pages/Checkout.jsx` | `loadOrder`, `loadDraft` |
| `useEffect` and cleanup | `src/context/MealsContext.jsx`, `src/hooks/useCountdown.js`, `src/hooks/useNow.js` | abort a request, clear an interval |
| `useMemo`, Context API | `src/context/FiltersContext.jsx`, `OrderContext.jsx` | shared state above the router |
| Custom hooks | `src/hooks/` | `useNow`, `useCountdown`, `useDocumentTitle` |
| `useRef` | `src/pages/Checkout.jsx` | focus the error summary, avoid an empty-screen flash |
| Immutable updates | `OrderContext.jsx` | `setQuantity`, `placeOrder`, `cancelOrder` |
| Controlled form, validation | `src/pages/Checkout.jsx`, `src/lib/validation.js` | `validateDelivery` |
| Promises, async, AbortController | `src/data/mockApi.js` | `loadMeals` |
| localStorage persistence | `src/lib/storage.js`, `OrderContext.jsx`, `PreferencesContext.jsx` | `readJson`, `writeJson` |
| Pure functions, array methods | `src/rules/`, `src/lib/discovery.js`, `src/lib/pricing.js` | `filter`, `map`, `reduce`, `sort` |
| Derived state | `src/context/FiltersContext.jsx`, `src/lib/discovery.js` | `deriveFilters` |
| Conditional rendering, lists, keys | `src/pages/Order.jsx`, `Orders.jsx` | basket lines, order cards |
| Money in integer cents | `src/lib/format.js`, `src/lib/pricing.js` | `formatCents`, `calculateTotals` |
| Accessibility | `Layout.jsx`, `Checkout.jsx`, `QuantityControl.jsx` | skip link, `aria-*`, focus management |

## Credits

Meal photos are from Unsplash; see `/credits` or `src/data/credits.js`.
