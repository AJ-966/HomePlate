import { useOrder } from "../context/OrderContext.jsx";
import { checkQuantity } from "../rules/quantityRule.js";

// "Add to order" for a meal that is not in the order, or a - 1 + stepper when it is.
// The limits come from checkQuantity() (Rule 1); this component only shows the result.
export default function QuantityControl({ meal, className = "" }) {
  const { quantityOf, setQuantity } = useOrder();
  const quantity = quantityOf(meal.id);
  const { max, reason } = checkQuantity(quantity, meal);

  if (max === 0) {
    return (
      <button type="button" className={`btn btn--quiet qty-add ${className}`} disabled>
        Sold out today
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        className={`btn btn--primary qty-add ${className}`}
        onClick={() => setQuantity(meal, 1)}
        aria-label={`Add ${meal.name} to order`}
      >
        Add to order
      </button>
    );
  }

  return (
    <div className={`qty ${className}`} role="group" aria-label={`Quantity of ${meal.name}`}>
      <div className="qty__stepper">
        <button type="button" className="qty__btn" onClick={() => setQuantity(meal, quantity - 1)} aria-label={`Remove one ${meal.name}`}>
          −
        </button>
        <span className="qty__value" role="status" aria-label={`${quantity} in your order`}>
          {quantity}
        </span>
        <button
          type="button"
          className="qty__btn"
          onClick={() => setQuantity(meal, quantity + 1)}
          disabled={quantity >= max}
          aria-label={`Add one more ${meal.name}`}
        >
          +
        </button>
      </div>
      {quantity >= max && <p className="qty__limit">{reason}</p>}
    </div>
  );
}
