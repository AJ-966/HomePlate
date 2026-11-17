import { ALLERGEN_LABELS } from "../data/config.js";

export function allergenText(meal) {
  return meal.contains.length > 0
    ? meal.contains.map((key) => ALLERGEN_LABELS[key] ?? key).join(", ")
    : "No listed allergens";
}

// Decision D2: every meal states its size and allergens in the same plain way.
export default function PortionFacts({ meal }) {
  return (
    <dl className="facts">
      <div className="facts__row">
        <dt>Portion</dt>
        <dd>{meal.portionGrams} g cooked</dd>
      </div>
      <div className="facts__row">
        <dt>Serves</dt>
        <dd>1 portion = 1 adult meal (a main plus a side)</dd>
      </div>
      <div className="facts__row">
        <dt>Contains</dt>
        <dd>{allergenText(meal)}</dd>
      </div>
      <div className="facts__row">
        <dt>Cooked by</dt>
        <dd>{meal.cook}</dd>
      </div>
    </dl>
  );
}
