import { Link } from "react-router-dom";
import { PHOTO_CREDITS } from "../data/credits.js";
import { useMeals } from "../context/MealsContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function Credits() {
  useDocumentTitle("Photo credits");
  const { meals } = useMeals();
  const nameOf = (id) => meals.find((m) => m.id === id)?.name ?? id;

  return (
    <div className="container order">
      <h1 className="page-title">Photo credits</h1>
      <p className="confirmation__lead">
        Meal photos come from Unsplash and are illustrative. HomePlate’s cooks and dishes are made up, so a photo shows the
        style of dish, not a real cook’s plate. The weight in grams on each meal is the real portion information.
      </p>
      <ul className="plain-list conf-lines credits">
        {PHOTO_CREDITS.map((credit) => (
          <li key={credit.mealId}>
            <span>{nameOf(credit.mealId)}</span>
            <span>
              Photo by <a href={credit.profile}>{credit.photographer}</a> on <a href={credit.photoUrl}>Unsplash</a>
            </span>
          </li>
        ))}
      </ul>
      <p>
        <Link to="/meals" className="btn btn--primary">
          Back to meals
        </Link>
      </p>
    </div>
  );
}
