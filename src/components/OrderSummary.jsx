import { ZONES } from "../data/config.js";
import { formatCents } from "../lib/format.js";

// Subtotal, delivery fee, service fee and total (Decision D1: fees are visible before checkout).
// The delivery zone is chosen here because it sets the delivery fee.
export default function OrderSummary({ totals, zoneId, onZoneChange }) {
  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[0];
  return (
    <section className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="summary__title">
        Cost summary
      </h2>

      <fieldset className="zones">
        <legend>Delivery zone</legend>
        {ZONES.map((z) => (
          <label key={z.id} className="zones__option">
            <input type="radio" name="zone" value={z.id} checked={z.id === zoneId} onChange={() => onZoneChange(z.id)} />
            <span>
              <strong>{z.label}</strong> ({formatCents(z.feeCents)})
              <small>{z.description}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <dl className="summary__rows">
        <div>
          <dt>Meals</dt>
          <dd>{formatCents(totals.subtotalCents)}</dd>
        </div>
        <div>
          <dt>Delivery, {zone.label.toLowerCase()}</dt>
          <dd>{formatCents(totals.deliveryCents)}</dd>
        </div>
        <div>
          <dt>Service fee</dt>
          <dd>{formatCents(totals.serviceFeeCents)}</dd>
        </div>
        <div className="summary__total">
          <dt>Total</dt>
          <dd>{formatCents(totals.totalCents)}</dd>
        </div>
      </dl>
    </section>
  );
}
