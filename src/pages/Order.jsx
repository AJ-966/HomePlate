import { Link } from "react-router-dom";
import MealArt from "../components/MealArt.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import { EmptyState, ErrorMessage } from "../components/StatusMessage.jsx";
import { useMeals } from "../context/MealsContext.jsx";
import { useOrder } from "../context/OrderContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCents } from "../lib/format.js";
import { buildLines, calculateTotals } from "../lib/pricing.js";
import { checkOrderAgainstDiet } from "../rules/dietaryRule.js";

// Review step: change quantities, see every cost, then continue to delivery details.
export default function Order() {
  useDocumentTitle("Your order");
  const { status, meals, error, retry } = useMeals();
  const order = useOrder();
  const { requirements } = usePreferences();

  if (status === "loading") {
    return (
      <div className="container order">
        <h1 className="page-title">Your order</h1>
        <p role="status" className="state__loading">
          Loading your order…
        </p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="container order">
        <h1 className="page-title">Your order</h1>
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    );
  }

  const lines = buildLines(order.items, meals);
  const totals = calculateTotals(lines, order.zoneId);
  const unsuitable = checkOrderAgainstDiet(lines, requirements);

  return (
    <div className="container order">
      <h1 className="page-title">Your order</h1>

      {order.notices.length > 0 && (
        <div className="note note--warn" role="status">
          <ul className="plain-list">
            {order.notices.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <button type="button" className="btn btn--quiet" onClick={order.dismissNotices}>
            Dismiss
          </button>
        </div>
      )}

      {lines.length === 0 ? (
        <EmptyState
          title="Your order is empty"
          action={
            <Link to="/meals" className="btn btn--primary">
              Browse meals
            </Link>
          }
        >
          <p>Add a meal or two and the full cost, fees included, shows up here.</p>
        </EmptyState>
      ) : (
        <div className="order__layout">
          <div>
            {unsuitable.length > 0 && (
              <div className="note note--warn" role="alert">
                <p>
                  <strong>Some meals don’t fit your dietary needs.</strong> Remove them before you continue, or change your
                  needs on the Meals page.
                </p>
              </div>
            )}

            <ul className="order-lines">
              {lines.map(({ meal, quantity, lineCents }) => {
                const problem = unsuitable.find((u) => u.meal.id === meal.id);
                return (
                  <li key={meal.id} className="order-line">
                    <div className="order-line__art">
                      <MealArt meal={meal} decorative />
                    </div>
                    <div className="order-line__main">
                      <h2 className="order-line__name">
                        <Link to={`/meals/${meal.id}`}>{meal.name}</Link>
                      </h2>
                      <p className="order-line__meta">
                        {formatCents(meal.priceCents)} per portion, cooked by {meal.cook}
                      </p>
                      {problem && <p className="badge badge--warn">Not suitable: {problem.reasons.join(", ")}</p>}
                      <QuantityControl meal={meal} />
                    </div>
                    <div className="order-line__side">
                      <p className="order-line__total">{formatCents(lineCents)}</p>
                      <button type="button" className="link-quiet" onClick={() => order.removeMeal(meal.id)} aria-label={`Remove ${meal.name} from order`}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="order__aside">
            <OrderSummary totals={totals} zoneId={order.zoneId} onZoneChange={order.setZone} />
            <Link to="/checkout" className="btn btn--primary btn--large order__continue">
              Continue to delivery details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
