import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ZONES } from "../data/config.js";
import { formatCents } from "../lib/format.js";

// Running cost, shown on every page once the first meal is added (Decision D1).
// The headline number is the TOTAL WITH FEES, so the student never meets a surprise at checkout.
// "See fees" expands the breakdown. At 390 px this is a bar along the bottom; on wide screens a small
// panel in the bottom-right corner.
export default function OrderBar({ count, totals, zoneId }) {
  const [open, setOpen] = useState(false);
  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[0];

  // Escape closes the breakdown, so keyboard users are never stuck in it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <aside className="order-bar" aria-label="Order total">
      {open && (
        <dl id="order-bar-details" className="order-bar__rows">
          <div><dt>Meals</dt><dd>{formatCents(totals.subtotalCents)}</dd></div>
          <div><dt>Delivery, {zone.label.toLowerCase()}</dt><dd>{formatCents(totals.deliveryCents)}</dd></div>
          <div><dt>Service fee</dt><dd>{formatCents(totals.serviceFeeCents)}</dd></div>
        </dl>
      )}
      <div className="order-bar__head">
        <p className="order-bar__total">
          <span>
            {count} {count === 1 ? "portion" : "portions"}, fees included
          </span>
          <strong>{formatCents(totals.totalCents)}</strong>
        </p>
        <button type="button" className="link-quiet" aria-expanded={open} aria-controls="order-bar-details" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide fees" : "See fees"}
        </button>
        <Link to="/order" className="btn btn--primary">
          View basket
        </Link>
      </div>
    </aside>
  );
}
