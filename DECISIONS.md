# Frontend decisions

Each entry addresses one problem found on foodpanda.pk (see the report, Section 4).
Code locations are planned and will be updated once each feature is built.

## D1: Running cost summary from the first item

- **Type:** information hierarchy and mobile layout
- **Problem:** delivery and platform fees appear only in the cart.
- **Decision:** show a summary (subtotal, delivery fee for the selected zone, service fee, total) as soon as the first meal is added. Wide screens show it beside the list; at 390 px it becomes a bottom bar with the total and an expand control.
- **Alternative:** show fees only at checkout, with a notice on menu pages that fees apply.
- **Reason:** the task is judging the real cost before committing; seeing fees early removes the surprise and supports a completed order.
- **Tradeoff:** uses screen space, needs a delivery zone chosen early (default: Inner zone, with a change control), and adds shared state every page must keep consistent.
- **Code location:** TODO (planned: `src/components/OrderSummary.jsx`, `calculateTotals()` in `src/lib/pricing.js`)
- **Evidence:** TODO (screenshot and steps)

## D2: Defined portions and a USD price filter

- **Type:** information hierarchy (content) with filter interaction
- **Problem:** serving sizes are undefined and the price filter offers only $, $$, $$$.
- **Decision:** every card and the details page show cooked weight, "1 portion = 1 adult meal" and allergens. The price filter uses USD ranges, and active filters show as removable chips next to the result count.
- **Alternative:** keep $, $$, $$$ symbols and add a tooltip explaining each tier.
- **Reason:** students compare value and stay within a budget; real weights and dollar ranges let them do that without opening every meal.
- **Tradeoff:** cards carry more text, so layout needs care at 390 px, and cooks must supply accurate weights.
- **Code location:** `src/components/MealCard.jsx`, `src/components/PortionFacts.jsx`, `src/components/FilterBar.jsx`, `filterMeals()` and `deriveFilters()` in `src/lib/discovery.js`
- **Evidence:** TODO (screenshot and steps)

## D3: Visible cancellation control with a countdown

- **Type:** interaction and state
- **Problem:** the cancellation condition is not shown before ordering, and recovery goes through help chat.
- **Decision:** state the rule at slot selection and before Place order. The confirmation page shows a Cancel order button with a live countdown to the deadline; after the deadline the button is disabled with the reason. Order status is saved in local storage.
- **Alternative:** a "Need help?" link that opens a contact form after ordering.
- **Reason:** the task is undoing a mistake quickly; a direct control with a visible deadline avoids a search through help menus.
- **Tradeoff:** needs a timer with cleanup and time-dependent state that is harder to test, so a demo clock control is provided. Cancellation is simulated only.
- **Code location:** TODO (planned: `src/pages/Confirmation.jsx`, `useCountdown()` in `src/hooks/useCountdown.js`, `src/rules/slotRule.js`)
- **Evidence:** TODO (screenshot and steps)
