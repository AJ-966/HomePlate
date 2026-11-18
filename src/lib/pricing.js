// Cost of an order. Money is integer cents throughout.

import { SERVICE_FEE_CENTS, ZONES } from "../data/config.js";

/** Joins saved items with menu data: [{ meal, quantity, lineCents }]. Unknown meals are skipped. */
export function buildLines(items, meals) {
  const lines = [];
  for (const item of items) {
    const meal = meals.find((m) => m.id === item.mealId);
    if (meal) lines.push({ meal, quantity: item.quantity, lineCents: meal.priceCents * item.quantity });
  }
  return lines;
}

/**
 * Subtotal, delivery fee for the zone, service fee and total.
 * An empty order costs nothing: no fees are charged for zero meals.
 */
export function calculateTotals(lines, zoneId) {
  if (lines.length === 0) return { subtotalCents: 0, deliveryCents: 0, serviceFeeCents: 0, totalCents: 0 };
  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[0];
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineCents, 0);
  const deliveryCents = zone.feeCents;
  const serviceFeeCents = SERVICE_FEE_CENTS;
  return { subtotalCents, deliveryCents, serviceFeeCents, totalCents: subtotalCents + deliveryCents + serviceFeeCents };
}
