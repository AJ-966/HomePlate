// Searching, filtering and sorting meals. Every function here is pure: it never changes
// its inputs and returns new arrays, which keeps React state updates predictable.

import { checkMealAgainstDiet } from "../rules/dietaryRule.js";
import { formatCents, parseDollarsToCents } from "./format.js";

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "portion-desc", label: "Largest portion" },
];

// Every word the student types must appear somewhere in the meal's searchable text.
export function matchesSearch(meal, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [meal.name, meal.cuisine, meal.cook, meal.description].join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function filterMeals(
  meals,
  { query = "", cuisines = [], minCents = null, maxCents = null, requirements = [], hideUnsuitable = false } = {}
) {
  return meals.filter((meal) => {
    if (!matchesSearch(meal, query)) return false;
    if (cuisines.length > 0 && !cuisines.includes(meal.cuisine)) return false;
    if (minCents !== null && meal.priceCents < minCents) return false;
    if (maxCents !== null && meal.priceCents > maxCents) return false;
    if (hideUnsuitable && !checkMealAgainstDiet(meal, requirements).suitable) return false;
    return true;
  });
}

export function sortMeals(meals, sortId) {
  const copy = [...meals]; // never sort the original array in place
  switch (sortId) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "portion-desc":
      return copy.sort((a, b) => b.portionGrams - a.portionGrams);
    default:
      return copy; // "recommended" keeps the original order
  }
}

// Works out what the filter state means: usable price limits, a message if the prices
// are not usable, and the list of active filters shown as removable chips.
export function deriveFilters(filters) {
  const min = parseDollarsToCents(filters.minText);
  const max = parseDollarsToCents(filters.maxText);

  let minCents = min.status === "ok" ? min.cents : null;
  let maxCents = max.status === "ok" ? max.cents : null;
  let priceMessage = "";

  if (min.status === "invalid" || max.status === "invalid") {
    priceMessage = "Enter prices like 9 or 9.50.";
    minCents = null;
    maxCents = null;
  } else if (minCents !== null && maxCents !== null && minCents > maxCents) {
    priceMessage = "The minimum price is higher than the maximum.";
    minCents = null;
    maxCents = null;
  }

  const activeFilters = [];
  const query = filters.query.trim();
  if (query) activeFilters.push({ id: "q", label: `Search: ${query}` });
  filters.cuisines.forEach((c) => activeFilters.push({ id: `cuisine:${c}`, label: c }));
  if (minCents !== null) activeFilters.push({ id: "min", label: `From ${formatCents(minCents)}` });
  if (maxCents !== null) activeFilters.push({ id: "max", label: `Up to ${formatCents(maxCents)}` });
  if (filters.hideUnsuitable) activeFilters.push({ id: "hide", label: "Hiding unsuitable meals" });

  return { minCents, maxCents, priceMessage, activeFilters };
}
