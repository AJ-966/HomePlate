// Status of a placed order, derived from the order and the current time.
// Pure: the clock is passed in, so it is easy to test.

const HOUR_MS = 60 * 60 * 1000;

/**
 * "cancelled": the student cancelled it.
 * "completed": the delivery slot has ended (the delivery is simulated).
 * "active":    placed and still to come; free cancellation may or may not still be open.
 */
export function orderStatus(order, now) {
  if (order.status === "cancelled") return "cancelled";
  const slotEnd = new Date(order.slotStart).getTime() + HOUR_MS;
  return now.getTime() >= slotEnd ? "completed" : "active";
}

export const STATUS_LABEL = { active: "Booked", cancelled: "Cancelled", completed: "Completed" };

/** "2 × Chicken Biryani, 1 × Pad Thai" */
export function itemsSummary(order) {
  return order.lines.map((line) => `${line.quantity} × ${line.name}`).join(", ");
}
