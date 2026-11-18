import test from "node:test";
import assert from "node:assert/strict";
import { checkQuantity, maxForMeal, reconcileItems } from "../src/rules/quantityRule.js";
import { calculateTotals, buildLines } from "../src/lib/pricing.js";
import { cancelDeadline, canCancel, getAvailableSlots, validateSlot } from "../src/rules/slotRule.js";
import { checkMealAgainstDiet, checkOrderAgainstDiet } from "../src/rules/dietaryRule.js";
import { validateDelivery } from "../src/lib/validation.js";
import { parseDollarsToCents } from "../src/lib/format.js";

const meal = (over = {}) => ({ id: "x", name: "Test", priceCents: 1000, dietTags: [], contains: [], remainingStock: 10, ...over });

test("quantity: capped at 4 per order", () => {
  assert.equal(maxForMeal(meal()), 4);
  const r = checkQuantity(5, meal());
  assert.equal(r.quantity, 4);
  assert.equal(r.ok, false);
  assert.match(r.reason, /Limit of 4/);
});

test("quantity: capped by remaining stock, and sold out is 0", () => {
  assert.equal(checkQuantity(3, meal({ remainingStock: 2 })).quantity, 2);
  assert.equal(checkQuantity(1, meal({ remainingStock: 0 })).reason, "Sold out today");
  assert.equal(checkQuantity(2, meal()).ok, true);
});

test("quantity: bad input is treated as zero", () => {
  assert.equal(checkQuantity(-1, meal()).quantity, 0);
  assert.equal(checkQuantity(1.5, meal()).quantity, 0);
  assert.equal(checkQuantity(NaN, meal()).quantity, 0);
});

test("reconcile: removes sold out and missing meals, lowers over-stock", () => {
  const menu = [meal({ id: "a", remainingStock: 0 }), meal({ id: "b", remainingStock: 2 }), meal({ id: "c" })];
  const { items, notices } = reconcileItems(
    [{ mealId: "a", quantity: 1 }, { mealId: "b", quantity: 4 }, { mealId: "c", quantity: 2 }, { mealId: "zz", quantity: 1 }],
    menu
  );
  assert.deepEqual(items, [{ mealId: "b", quantity: 2 }, { mealId: "c", quantity: 2 }]);
  assert.equal(notices.length, 3);
});

test("pricing: totals add subtotal, zone fee and service fee", () => {
  const lines = buildLines([{ mealId: "x", quantity: 2 }], [meal()]);
  assert.deepEqual(calculateTotals(lines, "inner"), { subtotalCents: 2000, deliveryCents: 250, serviceFeeCents: 100, totalCents: 2350 });
  assert.equal(calculateTotals(lines, "outer").totalCents, 2500);
});

test("pricing: empty order costs nothing", () => {
  assert.equal(calculateTotals([], "inner").totalCents, 0);
});

test("slots: need 3 hours notice and run 11:00 to 21:00", () => {
  const now = new Date(2026, 10, 18, 9, 30); // 9:30 AM
  const slots = getAvailableSlots(now).map((s) => new Date(s.start));
  assert.equal(slots[0].getHours(), 13); // 12:30 is the earliest moment, so 1 PM is the first slot
  assert.ok(slots.every((s) => s.getHours() >= 11 && s.getHours() <= 21));
  assert.equal(slots.filter((s) => s.getDate() === 19).length, 11); // all of tomorrow
});

test("slots: exactly 3 hours ahead is allowed", () => {
  const now = new Date(2026, 10, 18, 10, 0);
  assert.equal(new Date(getAvailableSlots(now)[0].start).getHours(), 13);
});

test("slots: late evening leaves only tomorrow", () => {
  const slots = getAvailableSlots(new Date(2026, 10, 18, 20, 0));
  assert.ok(slots.every((s) => new Date(s.start).getDate() === 19));
});

test("slots: a chosen slot that has become too soon is rejected", () => {
  const start = new Date(2026, 10, 18, 13, 0).toISOString();
  assert.equal(validateSlot(start, new Date(2026, 10, 18, 9, 30)).valid, true);
  assert.equal(validateSlot(start, new Date(2026, 10, 18, 11, 0)).valid, false);
  assert.equal(validateSlot("", new Date()).valid, false);
});

test("cancellation: free until 2 hours before the slot", () => {
  const start = new Date(2026, 10, 18, 13, 0).toISOString();
  assert.equal(new Date(cancelDeadline(start)).getHours(), 11);
  assert.equal(canCancel(start, new Date(2026, 10, 18, 10, 59)), true);
  assert.equal(canCancel(start, new Date(2026, 10, 18, 11, 0)), false);
});

test("diet: order check lists only unsuitable meals", () => {
  const lines = [
    { meal: meal({ id: "a", dietTags: ["vegan"] }), quantity: 1 },
    { meal: meal({ id: "b", contains: ["peanuts"] }), quantity: 1 },
  ];
  const bad = checkOrderAgainstDiet(lines, ["nut-free"]);
  assert.equal(bad.length, 1);
  assert.equal(bad[0].meal.id, "b");
  assert.equal(checkMealAgainstDiet(lines[0].meal, ["vegetarian", "vegan"]).suitable, true);
});

test("validation: delivery form", () => {
  const ok = { name: "Ayesha Khan", phone: "+1 (555) 010-2030", address: "12 Elm Street", notes: "" };
  assert.deepEqual(validateDelivery(ok), {});
  const bad = validateDelivery({ name: "1", phone: "abc", address: "a", notes: "x".repeat(201) });
  assert.deepEqual(Object.keys(bad).sort(), ["address", "name", "notes", "phone"]);
  assert.ok(validateDelivery({ ...ok, name: "   " }).name);
});

test("format: price parsing", () => {
  assert.deepEqual(parseDollarsToCents("9.50"), { status: "ok", cents: 950 });
  assert.equal(parseDollarsToCents("9.505").status, "invalid");
});
