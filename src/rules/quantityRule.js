// Rule 1: availability and capacity.
// A student may order at most MAX_PER_ORDER of one meal, and never more than the cook has left today.
// Pure functions: no React, no storage, so they are easy to test.

import { MAX_PER_ORDER } from "../data/config.js";

/** The most portions of this meal one order can hold right now. */
export function maxForMeal(meal) {
  return Math.max(0, Math.min(MAX_PER_ORDER, meal.remainingStock));
}

/**
 * Checks a requested quantity for one meal.
 * @returns { ok, quantity, max, reason }  `quantity` is the requested number pulled back into 0..max,
 *          `reason` explains (in words for the student) why the request could not be met, or null.
 */
export function checkQuantity(requested, meal) {
  const max = maxForMeal(meal);
  const wanted = Number.isInteger(requested) && requested > 0 ? requested : 0;
  const quantity = Math.min(wanted, max);

  // The reason is shown whenever the student is at the ceiling (or past it), so they know why "+" is off.
  let reason = null;
  if (max === 0) reason = "Sold out today";
  else if (wanted >= max) {
    reason = meal.remainingStock < MAX_PER_ORDER ? `Only ${meal.remainingStock} left today` : `Limit of ${MAX_PER_ORDER} per meal in one order`;
  }
  return { ok: wanted === quantity && wanted > 0, quantity, max, reason };
}

/**
 * Makes a saved selection consistent with today's menu: drops meals that no longer exist or are sold
 * out, and lowers quantities that now exceed stock.
 * @param items   [{ mealId, quantity }]
 * @param meals   current menu
 * @returns { items, notices }  notices are sentences to show the student.
 */
export function reconcileItems(items, meals) {
  const kept = [];
  const notices = [];

  for (const item of items) {
    const meal = meals.find((m) => m.id === item.mealId);
    if (!meal) {
      notices.push("A meal in your order is no longer on the menu, so we removed it.");
      continue;
    }
    const { quantity, max } = checkQuantity(item.quantity, meal);
    if (max === 0) {
      notices.push(`${meal.name} sold out, so we removed it from your basket.`);
    } else if (quantity < item.quantity) {
      notices.push(`Only ${max} of ${meal.name} ${max === 1 ? "is" : "are"} available, so we lowered your quantity.`);
      kept.push({ mealId: item.mealId, quantity });
    } else {
      kept.push(item);
    }
  }
  return { items: kept, notices };
}
