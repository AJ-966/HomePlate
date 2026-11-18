import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary.jsx";
import { EmptyState, ErrorMessage } from "../components/StatusMessage.jsx";
import { CANCEL_CUTOFF_HOURS, SLOT_LEAD_HOURS, ZONES } from "../data/config.js";
import { useMeals } from "../context/MealsContext.jsx";
import { useOrder } from "../context/OrderContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useNow } from "../hooks/useNow.js";
import { nowDate } from "../lib/clock.js";
import { buildLines, calculateTotals } from "../lib/pricing.js";
import { readJson, writeJson } from "../lib/storage.js";
import { dayLabel, slotRange, timeLabel } from "../lib/time.js";
import { NOTES_MAX, validateDelivery } from "../lib/validation.js";
import { checkOrderAgainstDiet } from "../rules/dietaryRule.js";
import { checkQuantity } from "../rules/quantityRule.js";
import { cancelDeadline, getAvailableSlots, validateSlot } from "../rules/slotRule.js";

const DRAFT_KEY = "homeplate.delivery";
const EMPTY = { name: "", phone: "", address: "", notes: "" };

// Only text fields are remembered. The slot is not, because a saved slot could be too soon by next visit.
function loadDraft() {
  const saved = readJson(DRAFT_KEY, {});
  const text = (v) => (typeof v === "string" ? v : "");
  return {
    remember: saved.remember !== false, // on by default; switched off, nothing is kept
    values: { name: text(saved.name), phone: text(saved.phone), address: text(saved.address), notes: text(saved.notes) },
  };
}

function makeOrderId() {
  return "HP-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default function Checkout() {
  useDocumentTitle("Delivery details");
  const navigate = useNavigate();
  const { status, meals, error, retry } = useMeals();
  const order = useOrder();
  const { requirements } = usePreferences();
  const now = useNow();

  const [draft] = useState(loadDraft); // read saved details once, when the page opens
  const [values, setValues] = useState(() => ({ ...EMPTY, ...draft.values }));
  const [remember, setRemember] = useState(draft.remember);
  const [slot, setSlot] = useState("");
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(0); // counts submit attempts, to move focus to the error summary
  const [slotNote, setSlotNote] = useState("");
  const summaryRef = useRef(null);
  const justPlaced = useRef(false); // stops the "empty order" screen flashing while we navigate away

  // "Remember my details" on: keep the text fields on this device. Off: delete them now and keep nothing.
  useEffect(() => {
    writeJson(DRAFT_KEY, remember ? { remember: true, ...values } : { remember: false });
  }, [values, remember]);

  const lines = buildLines(order.items, meals);
  const totals = calculateTotals(lines, order.zoneId);
  const slots = getAvailableSlots(now);
  const errors = validateDelivery(values);
  const slotCheck = validateSlot(slot, now);
  if (!slotCheck.valid) errors.slot = slotCheck.reason;

  // Problems with the order itself (not with the form fields).
  const unsuitable = checkOrderAgainstDiet(lines, requirements);
  const overStock = lines.filter((line) => checkQuantity(line.quantity, line.meal).quantity < line.quantity);
  const blocked = unsuitable.length > 0 || overStock.length > 0;

  const errorEntries = Object.entries(errors);
  useEffect(() => {
    if (attempted > 0 && summaryRef.current) summaryRef.current.focus();
  }, [attempted]);

  if (status === "loading") {
    return (
      <div className="container order">
        <h1 className="page-title">Delivery details</h1>
        <p role="status" className="state__loading">
          Loading your basket…
        </p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="container order">
        <h1 className="page-title">Delivery details</h1>
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    );
  }
  if (lines.length === 0 && !justPlaced.current) {
    return (
      <div className="container order">
        <h1 className="page-title">Delivery details</h1>
        <EmptyState
          title="There’s nothing to deliver yet"
          action={
            <Link to="/meals" className="btn btn--primary">
              Browse meals
            </Link>
          }
        >
          <p>Add at least one meal, then come back to choose a delivery slot.</p>
        </EmptyState>
      </div>
    );
  }

  const change = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));
  const blur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));
  const shown = (field) => (touched[field] || attempted > 0) && errors[field];

  function submit(event) {
    event.preventDefault();
    setAttempted((n) => n + 1);
    setTouched({ name: true, phone: true, address: true, notes: true, slot: true });
    if (blocked || errorEntries.length > 0) return;

    // Check the slot again with a fresh clock: the student may have left the page open for a while.
    const fresh = nowDate();
    if (!validateSlot(slot, fresh).valid) {
      setSlot("");
      setSlotNote("The slot you chose is no longer available. Please choose another.");
      return;
    }

    justPlaced.current = true;
    const placedId = makeOrderId();
    order.placeOrder({
      id: placedId,
      status: "placed",
      placedAt: fresh.toISOString(),
      slotStart: slot,
      cancelBy: cancelDeadline(slot),
      zoneId: order.zoneId,
      lines: lines.map((l) => ({ mealId: l.meal.id, name: l.meal.name, cook: l.meal.cook, quantity: l.quantity, priceCents: l.meal.priceCents })),
      totals,
      delivery: { name: values.name.trim(), phone: values.phone.trim(), address: values.address.trim(), notes: values.notes.trim() },
    });
    navigate(`/orders/${placedId}`, { state: { justPlaced: true } });
  }

  const zone = ZONES.find((z) => z.id === order.zoneId) ?? ZONES[0];
  const groups = [];
  for (const s of slots) {
    const label = dayLabel(new Date(s.start), now);
    const group = groups.find((g) => g.label === label);
    if (group) group.slots.push(s);
    else groups.push({ label, slots: [s] });
  }
  const selectedSlot = slotCheck.valid ? slot : "";

  return (
    <div className="container order">
      <Link to="/order" className="back-link">
        Back to your basket
      </Link>
      <h1 className="page-title">Delivery details</h1>

      <div className="order__layout">
        <form className="form" onSubmit={submit} noValidate>
          {attempted > 0 && errorEntries.length > 0 && (
            <div className="note note--warn" role="alert" tabIndex={-1} ref={summaryRef}>
              <p>
                <strong>Fix {errorEntries.length === 1 ? "this" : `these ${errorEntries.length}`} before placing your order:</strong>
              </p>
              <ul className="plain-list">
                {errorEntries.map(([field, message]) => (
                  <li key={field}>
                    <a href={`#field-${field}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {blocked && (
            <div className="note note--warn" role="alert">
              {unsuitable.length > 0 && (
                <p>
                  <strong>Not suitable for your dietary needs:</strong> {unsuitable.map((u) => `${u.meal.name} (${u.reasons.join(", ")})`).join("; ")}.{" "}
                  <Link to="/order">Edit your basket</Link>
                </p>
              )}
              {overStock.length > 0 && (
                <p>
                  <strong>Not enough left:</strong> {overStock.map((l) => l.meal.name).join(", ")}. <Link to="/order">Edit your basket</Link>
                </p>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="field-name">Name for the delivery</label>
            <input id="field-name" type="text" autoComplete="name" value={values.name} onChange={change("name")} onBlur={blur("name")}
              aria-invalid={shown("name") ? "true" : undefined} aria-describedby={shown("name") ? "err-name" : undefined} />
            {shown("name") && <p id="err-name" className="field__help field__help--error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="field-phone">Phone number</label>
            <input id="field-phone" type="tel" autoComplete="tel" value={values.phone} onChange={change("phone")} onBlur={blur("phone")}
              aria-invalid={shown("phone") ? "true" : undefined} aria-describedby={shown("phone") ? "err-phone" : undefined} />
            {shown("phone") && <p id="err-phone" className="field__help field__help--error">{errors.phone}</p>}
          </div>

          <div className="field">
            <label htmlFor="field-address">Delivery address</label>
            <input id="field-address" type="text" autoComplete="street-address" value={values.address} onChange={change("address")} onBlur={blur("address")}
              aria-invalid={shown("address") ? "true" : undefined} aria-describedby={shown("address") ? "err-address" : "help-address"} />
            {shown("address") ? (
              <p id="err-address" className="field__help field__help--error">{errors.address}</p>
            ) : (
              <p id="help-address" className="field__help">We deliver in the {zone.label.toLowerCase()} you picked: {zone.description.toLowerCase()}.</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="field-notes">Notes for the cook (optional)</label>
            <textarea id="field-notes" rows={3} value={values.notes} onChange={change("notes")} onBlur={blur("notes")}
              aria-invalid={shown("notes") ? "true" : undefined} aria-describedby="help-notes" />
            <p id="help-notes" className={shown("notes") ? "field__help field__help--error" : "field__help"}>
              {values.notes.length} of {NOTES_MAX} characters{shown("notes") ? `. ${errors.notes}` : ""}
            </p>
          </div>

          <div className="field">
            <label htmlFor="field-slot">Delivery slot</label>
            <select id="field-slot" value={selectedSlot} onChange={(e) => { setSlot(e.target.value); setSlotNote(""); }} onBlur={blur("slot")}
              aria-invalid={shown("slot") ? "true" : undefined} aria-describedby={shown("slot") ? "err-slot" : "help-slot"}>
              <option value="">Choose a slot</option>
              {groups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.slots.map((s) => (
                    <option key={s.start} value={s.start}>{slotRange(s.start)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {slotNote && <p className="field__help field__help--error" role="status">{slotNote}</p>}
            {shown("slot") && !slotNote && <p id="err-slot" className="field__help field__help--error">{errors.slot}</p>}
            <p id="help-slot" className="field__help">
              Slots need at least {SLOT_LEAD_HOURS} hours’ notice.
              {selectedSlot
                ? ` Free cancellation until ${timeLabel(cancelDeadline(selectedSlot), now)}, which is ${CANCEL_CUTOFF_HOURS} hours before your slot.`
                : ` You can cancel for free until ${CANCEL_CUTOFF_HOURS} hours before your slot.`}
            </p>
          </div>

          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>
              Remember my name, phone and address on this device
              <small className="field__help">Saved in this browser only. Untick it to delete the saved details.</small>
            </span>
          </label>

          <button type="submit" className="btn btn--primary btn--large" disabled={blocked}>
            Place order, {totals.totalCents > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totals.totalCents / 100) : "$0.00"}
          </button>
          <p className="field__help">This is a student project. Nothing is charged or delivered.</p>
        </form>

        <div className="order__aside">
          <OrderSummary totals={totals} zoneId={order.zoneId} onZoneChange={order.setZone} />
          <ul className="plain-list summary__items">
            {lines.map(({ meal, quantity }) => (
              <li key={meal.id}>{quantity} × {meal.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
