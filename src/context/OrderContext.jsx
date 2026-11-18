// The student's current order (meals and quantities, delivery zone) and the last placed order.
// Lives above the router so the selection survives moving between pages, and is saved in
// localStorage so it survives a reload. Quantities always pass through checkQuantity() (Rule 1).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_ZONE_ID, ZONES } from "../data/config.js";
import { nowDate } from "../lib/clock.js";
import { readJson, writeJson } from "../lib/storage.js";
import { checkQuantity, reconcileItems } from "../rules/quantityRule.js";
import { useMeals } from "./MealsContext.jsx";

const ORDER_KEY = "homeplate.order";
const ORDERS_KEY = "homeplate.orders";
const LEGACY_LAST_ORDER_KEY = "homeplate.lastOrder"; // milestones 3 and 4 saved only one order
const MAX_SAVED_ORDERS = 30;
const ZONE_IDS = new Set(ZONES.map((zone) => zone.id));

const OrderContext = createContext(null);

// Saved text is untrusted (it may be old, edited or corrupted), so keep only well-formed entries.
function loadOrder() {
  const saved = readJson(ORDER_KEY, {});
  const items = Array.isArray(saved.items)
    ? saved.items.filter((i) => i && typeof i.mealId === "string" && Number.isInteger(i.quantity) && i.quantity > 0)
    : [];
  const zoneId = ZONE_IDS.has(saved.zoneId) ? saved.zoneId : DEFAULT_ZONE_ID;
  return { items, zoneId };
}

const isOrder = (o) => o && typeof o.id === "string" && Array.isArray(o.lines) && typeof o.slotStart === "string";

// All placed orders, newest first. An order saved by an earlier version is carried over.
function loadOrders() {
  const saved = readJson(ORDERS_KEY, null);
  if (Array.isArray(saved)) return saved.filter(isOrder);
  const legacy = readJson(LEGACY_LAST_ORDER_KEY, null);
  return isOrder(legacy) ? [legacy] : [];
}

export function OrderProvider({ children }) {
  const { status, meals, reportOrders } = useMeals();
  const [order, setOrder] = useState(loadOrder);
  const [orders, setOrders] = useState(loadOrders);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    writeJson(ORDER_KEY, order);
  }, [order]);
  useEffect(() => {
    writeJson(ORDERS_KEY, orders);
    reportOrders(orders); // placing or cancelling an order changes today's stock
  }, [orders, reportOrders]);

  // Keep the selection consistent with the menu: whenever the menu loads or changes (for example a
  // restored order after a reload, or stock changed from the demo panel), drop sold-out meals and lower
  // quantities above stock. It is idempotent, so once consistent it stops changing anything.
  useEffect(() => {
    if (status !== "ready") return;
    const result = reconcileItems(order.items, meals);
    if (result.notices.length > 0) {
      setOrder((prev) => ({ ...prev, items: result.items }));
      setNotices((prev) => [...new Set([...prev, ...result.notices])]);
    }
  }, [status, meals, order.items]);

  const value = useMemo(() => {
    // Set a meal's quantity (0 removes it). The rule decides what is allowed.
    function setQuantity(meal, requested) {
      const { quantity } = checkQuantity(requested, meal);
      setOrder((prev) => {
        const exists = prev.items.some((i) => i.mealId === meal.id);
        let items;
        if (quantity === 0) items = prev.items.filter((i) => i.mealId !== meal.id);
        else if (exists) items = prev.items.map((i) => (i.mealId === meal.id ? { ...i, quantity } : i)); // same row
        else items = [...prev.items, { mealId: meal.id, quantity }];
        return { ...prev, items };
      });
    }
    return {
      items: order.items,
      zoneId: order.zoneId,
      orders,
      notices,
      count: order.items.reduce((sum, i) => sum + i.quantity, 0),
      quantityOf: (mealId) => order.items.find((i) => i.mealId === mealId)?.quantity ?? 0,
      setQuantity,
      removeMeal: (mealId) => setOrder((prev) => ({ ...prev, items: prev.items.filter((i) => i.mealId !== mealId) })),
      setZone: (zoneId) => ZONE_IDS.has(zoneId) && setOrder((prev) => ({ ...prev, zoneId })),
      dismissNotices: () => setNotices([]),
      // Saves the placed order (newest first) and empties the basket in one step.
      placeOrder: (placed) => {
        setOrders((prev) => [placed, ...prev].slice(0, MAX_SAVED_ORDERS));
        setOrder((prev) => ({ ...prev, items: [] }));
      },
      // Simulated cancellation: the order stays in the list, marked cancelled (Decision D3).
      cancelOrder: (id) =>
        setOrders((prev) =>
          prev.map((o) => (o.id === id && o.status === "placed" ? { ...o, status: "cancelled", cancelledAt: nowDate().toISOString() } : o))
        ),
    };
  }, [order, orders, notices]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const value = useContext(OrderContext);
  if (!value) throw new Error("useOrder must be used inside <OrderProvider>");
  return value;
}
