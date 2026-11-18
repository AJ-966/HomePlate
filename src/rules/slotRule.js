// Rule 3: fulfilment timing.
// Delivery slots are one hour long, start on the hour between SLOT_FIRST_HOUR and SLOT_LAST_HOUR, and
// must begin at least SLOT_LEAD_HOURS after the order is placed. Free cancellation ends
// CANCEL_CUTOFF_HOURS before the slot starts.
// `now` is always passed in (never read inside), so tests and the demo clock can control time.

import { CANCEL_CUTOFF_HOURS, SLOT_DAYS, SLOT_FIRST_HOUR, SLOT_LAST_HOUR, SLOT_LEAD_HOURS } from "../data/config.js";

const HOUR_MS = 60 * 60 * 1000;

/** Slots a student can book right now: [{ start: ISO string }], earliest first. */
export function getAvailableSlots(now) {
  const earliest = now.getTime() + SLOT_LEAD_HOURS * HOUR_MS;
  const slots = [];
  for (let day = 0; day < SLOT_DAYS; day++) {
    for (let hour = SLOT_FIRST_HOUR; hour <= SLOT_LAST_HOUR; hour++) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, 0, 0, 0);
      if (start.getTime() >= earliest) slots.push({ start: start.toISOString() });
    }
  }
  return slots;
}

/** Is this slot still bookable at `now`? (Checked again when the order is placed.) */
export function validateSlot(startIso, now) {
  if (!startIso) return { valid: false, reason: "Choose a delivery slot." };
  const stillOffered = getAvailableSlots(now).some((slot) => slot.start === startIso);
  return stillOffered
    ? { valid: true, reason: null }
    : { valid: false, reason: `That slot is no longer available. Slots need at least ${SLOT_LEAD_HOURS} hours’ notice.` };
}

/** The last moment a free cancellation is allowed, as an ISO string. */
export function cancelDeadline(startIso) {
  return new Date(new Date(startIso).getTime() - CANCEL_CUTOFF_HOURS * HOUR_MS).toISOString();
}

/** Can an order for this slot still be cancelled at `now`? */
export function canCancel(startIso, now) {
  return now.getTime() < new Date(cancelDeadline(startIso)).getTime();
}
