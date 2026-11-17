import { Link } from "react-router-dom";
import MealArt, { cuisineSlug } from "../components/MealArt.jsx";
import MealCard from "../components/MealCard.jsx";
import { ErrorMessage, LoadingGrid } from "../components/StatusMessage.jsx";
import { useMeals } from "../context/MealsContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { MEALS } from "../data/meals.js";
import {
  CANCEL_CUTOFF_HOURS,
  CUISINES,
  MAX_PER_ORDER,
  SERVICE_FEE_CENTS,
  SLOT_LEAD_HOURS,
  ZONES,
} from "../data/config.js";
import { formatCents } from "../lib/format.js";
import { checkMealAgainstDiet } from "../rules/dietaryRule.js";

// Hero plates are decorative, so they use the local data directly instead of waiting for the loader.
const HERO_IDS = ["m04", "m12", "m08"];
const FEATURED_IDS = ["m01", "m06", "m10"];

export default function Home() {
  useDocumentTitle("");
  const { status, meals, error, retry } = useMeals();
  const { toggleCuisine, clearAll } = useFilters();
  const { requirements } = usePreferences();

  const heroMeals = HERO_IDS.map((id) => MEALS.find((meal) => meal.id === id));
  const featured = FEATURED_IDS.map((id) => meals.find((meal) => meal.id === id)).filter(Boolean);
  const [inner, outer] = ZONES;

  // Arriving from a cuisine tile starts a fresh search for that cuisine only.
  function startWithCuisine(cuisine) {
    clearAll();
    toggleCuisine(cuisine);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <h1 className="hero__title">Dinner like someone made it for you.</h1>
            <p className="hero__lead">
              HomePlate connects students in Austin with home cooks who make Pakistani, Indian, Italian, Middle Eastern,
              East Asian and Mexican meals. Order a few hours ahead and it arrives at your door.
            </p>
            <div className="hero__actions">
              <Link to="/meals" className="btn btn--primary btn--large">
                Browse meals
              </Link>
              <a href="#how-it-works" className="link-quiet">
                See how it works
              </a>
            </div>
          </div>

          <div className="hero__plates" aria-hidden="true">
            {heroMeals.map((meal, index) => (
              <div key={meal.id} className={`plate plate--${index + 1}`}>
                <MealArt meal={meal} decorative />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" id="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title" className="section__title">
          How HomePlate works
        </h2>
        <ol className="steps">
          <li className="step">
            <h3 className="step__title">Pick a cuisine</h3>
            <p>Filter by cuisine, dietary needs and price. Every meal lists its cooked weight and allergens.</p>
          </li>
          <li className="step">
            <h3 className="step__title">Build your order</h3>
            <p>Order up to {MAX_PER_ORDER} portions of each meal, as long as the cook still has some left today.</p>
          </li>
          <li className="step">
            <h3 className="step__title">Choose a delivery time</h3>
            <p>
              Pick a slot at least {SLOT_LEAD_HOURS} hours ahead. Delivery is {formatCents(inner.feeCents)} in the inner
              zone and {formatCents(outer.feeCents)} in the outer zone, plus a {formatCents(SERVICE_FEE_CENTS)} service
              fee.
            </p>
          </li>
          <li className="step">
            <h3 className="step__title">Change your mind</h3>
            <p>Cancel for free until {CANCEL_CUTOFF_HOURS} hours before your slot.</p>
          </li>
        </ol>
      </section>

      <section className="section container" aria-labelledby="cuisine-title">
        <h2 id="cuisine-title" className="section__title">
          Start with a cuisine
        </h2>
        <ul className="cuisine-grid">
          {CUISINES.map((cuisine) => {
            const count = meals.filter((meal) => meal.cuisine === cuisine).length;
            return (
              <li key={cuisine}>
                <Link
                  to="/meals"
                  className="cuisine-tile"
                  style={{ "--tile-color": `var(--cuisine-${cuisineSlug(cuisine)})` }}
                  onClick={() => startWithCuisine(cuisine)}
                >
                  <span className="cuisine-tile__name">{cuisine}</span>
                  <span className="cuisine-tile__count">{status === "ready" ? `${count} meals` : " "}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section container" aria-labelledby="favourites-title">
        <h2 id="favourites-title" className="section__title">
          Cooks’ favourites this week
        </h2>
        {status === "loading" && <LoadingGrid count={3} />}
        {status === "error" && <ErrorMessage message={error} onRetry={retry} />}
        {status === "ready" && (
          <ul className="meal-grid">
            {featured.map((meal) => (
              <li key={meal.id}>
                <MealCard meal={meal} suitability={checkMealAgainstDiet(meal, requirements)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
