// Rule 2: dietary compatibility.
// A meal fits only if it meets EVERY requirement the student selected.
// Pure function: same inputs always give the same result, so it is easy to test.

import { ALLERGEN_LABELS } from "../data/config.js";

const NUT_ALLERGENS = ["peanuts", "tree-nuts"];

/**
 * @param meal          a meal record (uses meal.dietTags and meal.contains)
 * @param requirements  array of ids: "vegetarian" | "vegan" | "halal" | "nut-free"
 * @returns { suitable: boolean, reasons: string[] }  reasons are shown to the student
 */
export function checkMealAgainstDiet(meal, requirements = []) {
  const reasons = [];

  for (const requirement of requirements) {
    if (requirement === "vegetarian") {
      const isVegetarian = meal.dietTags.includes("vegetarian") || meal.dietTags.includes("vegan");
      if (!isVegetarian) reasons.push("Not vegetarian");
    }
    if (requirement === "vegan" && !meal.dietTags.includes("vegan")) {
      reasons.push("Not vegan");
    }
    if (requirement === "halal" && !meal.dietTags.includes("halal")) {
      reasons.push("Not halal");
    }
    if (requirement === "nut-free") {
      const nuts = meal.contains.filter((item) => NUT_ALLERGENS.includes(item));
      if (nuts.length > 0) {
        reasons.push("Contains " + nuts.map((n) => ALLERGEN_LABELS[n].toLowerCase()).join(" and "));
      }
    }
  }

  return { suitable: reasons.length === 0, reasons };
}

/**
 * Checks every meal in an order. Returns only the meals that do NOT fit, each with its reasons,
 * so the order page can say exactly which meals to remove.
 * @param lines  [{ meal, quantity }] from buildLines()
 */
export function checkOrderAgainstDiet(lines, requirements = []) {
  return lines
    .map((line) => ({ meal: line.meal, ...checkMealAgainstDiet(line.meal, requirements) }))
    .filter((result) => !result.suitable);
}
