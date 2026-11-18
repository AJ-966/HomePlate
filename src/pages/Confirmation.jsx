import { Link } from "react-router-dom";
import { EmptyState } from "../components/StatusMessage.jsx";
import { ZONES } from "../data/config.js";
import { useOrder } from "../context/OrderContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNow } from "../hooks/useNow.js";
import { formatCents } from "../lib/format.js";
import { slotLabel, timeLabel } from "../lib/time.js";

// Shows the order that was just placed. It is read from saved state, so a reload keeps it.
export default function Confirmation() {
  const { lastOrder } = useOrder();
  const now = useNow();
  useDocumentTitle(lastOrder ? "Order placed" : "No recent order");

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
      <h1 className="page-title">Order placed</h1>
      <p className="confirmation__lead" role="status">
        Thanks, {delivery.name}. Your order <strong>{lastOrder.id}</strong> is booked for {slotLabel(lastOrder.slotStart, now)}.
      </p>

      <p className="note note--good">Free cancellation until {timeLabel(lastOrder.cancelBy, now)}.</p>

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
