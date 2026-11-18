import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/StatusMessage.jsx";
import { ZONES } from "../data/config.js";
import { useOrder } from "../context/OrderContext.jsx";
import { useCountdown } from "../hooks/useCountdown.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNow } from "../hooks/useNow.js";
import { formatCents } from "../lib/format.js";
import { formatRemaining, slotLabel, timeLabel } from "../lib/time.js";
import { CANCEL_CUTOFF_HOURS } from "../data/config.js";
import { canCancel } from "../rules/slotRule.js";

// Shows the order that was just placed. It is read from saved state, so a reload keeps it.
// The cancel control with a live countdown to the deadline (Decision D3).
// Rule 3 decides: free cancellation until CANCEL_CUTOFF_HOURS before the slot starts.
function CancelPanel({ order, onCancel, now }) {
  const { msLeft, expired } = useCountdown(order.cancelBy);
  const [confirming, setConfirming] = useState(false);
  const [tooLate, setTooLate] = useState(false);

  if (order.status === "cancelled") {
    return (
      <div className="cancel cancel--done" role="status">
        <h2 className="cancel__title">Order cancelled</h2>
        <p>Order {order.id} was cancelled and nothing was charged. You can order again any time.</p>
      </div>
    );
  }

  const closed = expired || tooLate;

  function confirmCancel() {
    // Check again with a fresh clock: the deadline may have passed while the question was open.
    if (!canCancel(order.slotStart, new Date())) {
      setTooLate(true);
      setConfirming(false);
      return;
    }
    onCancel();
  }

  return (
    <div className="cancel">
      <h2 className="cancel__title">Need to cancel?</h2>
      {closed ? (
        <p className="cancel__time cancel__time--closed">
          Free cancellation closed at {timeLabel(order.cancelBy, now)}, {CANCEL_CUTOFF_HOURS} hours before your slot.
        </p>
      ) : (
        <p className="cancel__time">Free cancellation ends in {formatRemaining(msLeft)}.</p>
      )}

      {confirming && !closed ? (
        <div role="group" aria-label="Confirm cancellation">
          <p>Cancel order {order.id}? This can’t be undone.</p>
          <div className="cancel__actions">
            <button type="button" className="btn btn--primary" onClick={confirmCancel}>
              Yes, cancel order
            </button>
            <button type="button" className="btn btn--quiet" autoFocus onClick={() => setConfirming(false)}>
              Keep order
            </button>
          </div>
        </div>
      ) : (
        <div className="cancel__actions">
          <button type="button" className="btn btn--primary" disabled={closed} onClick={() => setConfirming(true)} aria-describedby={closed ? "cancel-closed" : undefined}>
            Cancel order
          </button>
        </div>
      )}
      {closed && (
        <p id="cancel-closed" className="field__help">
          The cook has already started planning your meal, so this order can no longer be cancelled here.
        </p>
      )}
    </div>
  );
}

export default function Confirmation() {
  const { lastOrder, cancelOrder } = useOrder();
  const now = useNow();
  useDocumentTitle(!lastOrder ? "No recent order" : lastOrder.status === "cancelled" ? "Order cancelled" : "Order placed");

  if (!lastOrder) {
    return (
      <div className="container order">
        <h1 className="page-title">No recent order</h1>
        <EmptyState
          title="You haven’t placed an order yet"
          action={
            <Link to="/meals" className="btn btn--primary">
              Browse meals
            </Link>
          }
        >
          <p>Once you place an order, its details and cancellation deadline appear here.</p>
        </EmptyState>
      </div>
    );
  }

  const { delivery, totals, lines } = lastOrder;
  const zone = ZONES.find((z) => z.id === lastOrder.zoneId) ?? ZONES[0];

  return (
    <div className="container order confirmation">
      <h1 className="page-title">{lastOrder.status === "cancelled" ? "Order cancelled" : "Order placed"}</h1>
      <p className="confirmation__lead" role="status">
        Thanks, {delivery.name}. Your order <strong>{lastOrder.id}</strong> {lastOrder.status === "cancelled" ? "was booked for" : "is booked for"} {slotLabel(lastOrder.slotStart, now)}.
      </p>

      <CancelPanel order={lastOrder} onCancel={cancelOrder} now={now} />

      <div className="order__layout">
        <section aria-labelledby="conf-items">
          <h2 id="conf-items" className="details__subtitle">
            What you ordered
          </h2>
          <ul className="plain-list conf-lines">
            {lines.map((line) => (
              <li key={line.mealId}>
                <span>
                  {line.quantity} × {line.name}
                  <small>Cooked by {line.cook}</small>
                </span>
                <span>{formatCents(line.priceCents * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary__rows">
            <div><dt>Meals</dt><dd>{formatCents(totals.subtotalCents)}</dd></div>
            <div><dt>Delivery, {zone.label.toLowerCase()}</dt><dd>{formatCents(totals.deliveryCents)}</dd></div>
            <div><dt>Service fee</dt><dd>{formatCents(totals.serviceFeeCents)}</dd></div>
            <div className="summary__total"><dt>Total</dt><dd>{formatCents(totals.totalCents)}</dd></div>
          </dl>
        </section>

        <section aria-labelledby="conf-delivery">
          <h2 id="conf-delivery" className="details__subtitle">
            Delivery
          </h2>
          <dl className="facts">
            <div className="facts__row"><dt>Name</dt><dd>{delivery.name}</dd></div>
            <div className="facts__row"><dt>Phone</dt><dd>{delivery.phone}</dd></div>
            <div className="facts__row"><dt>Address</dt><dd>{delivery.address}</dd></div>
            <div className="facts__row"><dt>Slot</dt><dd>{slotLabel(lastOrder.slotStart, now)}</dd></div>
            {delivery.notes && <div className="facts__row"><dt>Notes</dt><dd>{delivery.notes}</dd></div>}
          </dl>
          <Link to="/meals" className="btn btn--primary">
            Order more meals
          </Link>
        </section>
      </div>
    </div>
  );
}
