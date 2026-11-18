// Rule 4 (stock): portions in orders that are still booked are taken off today's stock, and a
// cancelled order gives them back. Pure functions, so they can be tested with any list of orders.

const sameDay = (iso, now) => new Date(iso).toDateString() === now.toDateString();

/** Portions per meal held by booked (not cancelled) orders placed today. */
export function reservedByMeal(orders, now) {
  const reserved = {};
  for (const order of orders) {
    if (order.status !== "placed" || !sameDay(order.placedAt, now)) continue;
    for (const line of order.lines) {
      reserved[line.mealId] = (reserved[line.mealId] ?? 0) + line.quantity;
    }
  }
  return reserved;
}

/** Menu with booked portions subtracted. A meal whose stock was set from the demo panel is left alone. */
export function applyReserved(meals, orders, now) {
  const reserved = reservedByMeal(orders, now);
  return meals.map((meal) =>
    meal.stockFixed ? meal : { ...meal, remainingStock: Math.max(0, meal.remainingStock - (reserved[meal.id] ?? 0)) }
  );
}
