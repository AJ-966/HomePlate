import { Link } from "react-router-dom";
import { EmptyState } from "../components/StatusMessage.jsx";
import { useOrder } from "../context/OrderContext.jsx";
import { useCountdown } from "../hooks/useCountdown.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNow } from "../hooks/useNow.js";
import { formatCents } from "../lib/format.js";
import { itemsSummary, orderStatus, STATUS_LABEL } from "../lib/orders.js";
import { formatRemaining, slotLabel } from "../lib/time.js";

// One line about free cancellation for a booked order, ticking down.
function CancelLine({ order }) {
  const { msLeft, expired } = useCountdown(order.cancelBy);
  return expired ? (
    <p className="order-card__cancel order-card__cancel--closed">Free cancellation has closed.</p>
  ) : (
    <p className="order-card__cancel">Free cancellation ends in {formatRemaining(msLeft)}.</p>
  );
}

function OrderCard({ order, now }) {
  const status = orderStatus(order, now);
  return (
    <li className="order-card">
      <div className="order-card__head">
        <h3 className="order-card__id">
          <Link to={`/orders/${order.id}`}>Order {order.id}</Link>
        </h3>
        <span className={`badge badge--${status}`}>{STATUS_LABEL[status]}</span>
      </div>
      <p className="order-card__items">{itemsSummary(order)}</p>
      <p className="order-card__meta">
        {slotLabel(order.slotStart, now)}. Total {formatCents(order.totals.totalCents)}.
      </p>
      {status === "active" && <CancelLine order={order} />}
    </li>
  );
}

// All orders saved on this device, newest first, split into booked and earlier ones.
export default function Orders() {
  useDocumentTitle("Your orders");
  const { orders } = useOrder();
  const now = useNow();

  const booked = orders.filter((o) => orderStatus(o, now) === "active");
  const earlier = orders.filter((o) => orderStatus(o, now) !== "active");

  return (
    <div className="container order">
      <h1 className="page-title">Your orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          action={
            <Link to="/meals" className="btn btn--primary">
              Browse meals
            </Link>
          }
        >
          <p>Orders you place appear here with their status and a cancel option while it’s still free. They’re saved on this device only.</p>
        </EmptyState>
      ) : (
        <>
          <section aria-labelledby="booked-title">
            <h2 id="booked-title" className="details__subtitle">
              Booked
            </h2>
            {booked.length === 0 ? (
              <p>Nothing booked right now.</p>
            ) : (
              <ul className="plain-list order-cards">
                {booked.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} />
                ))}
              </ul>
            )}
          </section>

          {earlier.length > 0 && (
            <section aria-labelledby="earlier-title">
              <h2 id="earlier-title" className="details__subtitle">
                Earlier orders
              </h2>
              <ul className="plain-list order-cards">
                {earlier.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
