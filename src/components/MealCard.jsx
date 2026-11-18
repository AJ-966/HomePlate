import { Link } from "react-router-dom";
import MealArt from "./MealArt.jsx";
import DietTags from "./DietTags.jsx";
import QuantityControl from "./QuantityControl.jsx";
import Stock from "./Stock.jsx";
import { allergenText } from "./PortionFacts.jsx";
import { formatCentsShort } from "../lib/format.js";

// One meal in a grid. `suitability` comes from checkMealAgainstDiet(): { suitable, reasons }.
export default function MealCard({ meal, suitability }) {
  const classes = suitability.suitable ? "meal-card" : "meal-card meal-card--muted";

  return (
    <article className={classes}>
      <div className="meal-card__art">
        <MealArt meal={meal} decorative />
        <span className="price-sticker">{formatCentsShort(meal.priceCents)}</span>
      </div>

      <div className="meal-card__body">
        <h3 className="meal-card__name">
          <Link to={`/meals/${meal.id}`} className="meal-card__link">
            {meal.name}
          </Link>
        </h3>
        <p className="meal-card__meta">
          {meal.cuisine}, cooked by {meal.cook}
        </p>
        <p>{meal.portionGrams} g cooked, 1 portion = 1 adult meal</p>
        <DietTags tags={meal.dietTags} />
        <p className="meal-card__allergens">{meal.contains.length > 0 ? `Contains: ${allergenText(meal)}` : allergenText(meal)}</p>
        <Stock remaining={meal.remainingStock} />
        {!suitability.suitable && (
          <p className="badge badge--warn">Not suitable: {suitability.reasons.join(", ")}</p>
        )}
        <QuantityControl meal={meal} className="meal-card__action" />
      </div>
    </article>
  );
}
