import { Link, useParams } from "react-router-dom";
import MealArt from "../components/MealArt.jsx";
import DietTags from "../components/DietTags.jsx";
import PortionFacts from "../components/PortionFacts.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import Stock from "../components/Stock.jsx";
import MealCard from "../components/MealCard.jsx";
import { ErrorMessage, EmptyState } from "../components/StatusMessage.jsx";
import { useMeals } from "../context/MealsContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { DIET_OPTIONS } from "../data/config.js";
import { formatCents } from "../lib/format.js";
import { checkMealAgainstDiet } from "../rules/dietaryRule.js";

export default function MealDetails() {
  const { id } = useParams(); // the :id part of /meals/:id
  const { status, meals, error, retry } = useMeals();
  const { requirements } = usePreferences();

  const meal = meals.find((item) => item.id === id);

  // Hooks must run on every render, so the title is set before any early return.
  useDocumentTitle(meal ? meal.name : status === "ready" ? "Meal not found" : "Meal");

  const backLink = (
    <Link to="/meals" className="back-link">
      Back to all meals
    </Link>
  );

  if (status === "loading") {
    return (
      <div className="container details">
        {backLink}
        <p role="status" className="state__loading">
          Loading meal…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container details">
        {backLink}
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    );
  }

  // An id that matches no meal, such as /meals/m99.
  if (!meal) {
    return (
      <div className="container details">
        {backLink}
        <EmptyState title="That meal isn’t on the menu">
          <p>
            There’s no meal with the code “{id}”. It may have been removed, or the link may have a typo. Browse the full
            menu, or try one of these.
          </p>
          <ul className="meal-grid meal-grid--compact">
            {meals.slice(0, 3).map((item) => (
              <li key={item.id}>
                <MealCard meal={item} suitability={checkMealAgainstDiet(item, requirements)} />
              </li>
            ))}
          </ul>
        </EmptyState>
      </div>
    );
  }

  const suitability = checkMealAgainstDiet(meal, requirements);
  const requirementLabels = DIET_OPTIONS.filter((option) => requirements.includes(option.id)).map((option) => option.label);

  return (
    <div className="container details">
      {backLink}

      <div className="details__layout">
        <div className="details__art">
          <MealArt meal={meal} />
          {meal.photo && <p className="field__help">Illustrative photo. A real portion is {meal.portionGrams} g cooked.</p>}
        </div>

        <div className="details__info">
          <h1 className="details__title">{meal.name}</h1>
          <p className="details__meta">
            {meal.cuisine} cooked by {meal.cook}
          </p>
          <p className="details__description">{meal.description}</p>

          <p className="details__price">{formatCents(meal.priceCents)} per portion</p>
          <Stock remaining={meal.remainingStock} />
          <DietTags tags={meal.dietTags} />

          {requirements.length === 0 && (
            <p className="note">Choose your dietary needs on the Meals page and we’ll check this meal against them.</p>
          )}
          {requirements.length > 0 && suitability.suitable && (
            <p className="note note--good">Fits your dietary needs: {requirementLabels.join(", ")}.</p>
          )}
          {requirements.length > 0 && !suitability.suitable && (
            <p className="note note--warn">Not suitable for your dietary needs: {suitability.reasons.join(", ")}.</p>
          )}

          <QuantityControl meal={meal} className="details__action" />

          <h2 className="details__subtitle">What’s in a portion</h2>
          <PortionFacts meal={meal} />
        </div>
      </div>
    </div>
  );
}
