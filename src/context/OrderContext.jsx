// The student's current order (meals and quantities, delivery zone) and the last placed order.
// Lives above the router so the selection survives moving between pages, and is saved in
// localStorage so it survives a reload. Quantities always pass through checkQuantity() (Rule 1).

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_ZONE_ID, ZONES } from "../data/config.js";
import { readJson, writeJson } from "../lib/storage.js";
import { checkQuantity, reconcileItems } from "../rules/quantityRule.js";
import { useMeals } from "./MealsContext.jsx";

const ORDER_KEY = "homeplate.order";
const LAST_ORDER_KEY = "homeplate.lastOrder";
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

function loadLastOrder() {
  const saved = readJson(LAST_ORDER_KEY, null);
  return saved && typeof saved.id === "string" && Array.isArray(saved.lines) ? saved : null;
}

export function OrderProvider({ children }) {
  const { status, meals } = useMeals();
  const [order, setOrder] = useState(loadOrder);
  const [lastOrder, setLastOrder] = useState(loadLastOrder);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    writeJson(ORDER_KEY, order);
  }, [order]);
  useEffect(() => {
    writeJson(LAST_ORDER_KEY, lastOrder);
  }, [lastOrder]);

  // When the menu first loads, make a restored selection match it (sold out, removed, over stock).
  const reconciled = useRef(false);
  useEffect(() => {
    if (status !== "ready" || reconciled.current) return;
    reconciled.current = true;
    const result = reconcileItems(order.items, meals);
    if (result.notices.length > 0) {
      setOrder((prev) => ({ ...prev, items: result.items }));
      setNotices([...new Set(result.notices)]);
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
      lastOrder,
      notices,
      count: order.items.reduce((sum, i) => sum + i.quantity, 0),
      quantityOf: (mealId) => order.items.find((i) => i.mealId === mealId)?.quantity ?? 0,
      setQuantity,
      removeMeal: (mealId) => setOrder((prev) => ({ ...prev, items: prev.items.filter((i) => i.mealId !== mealId) })),
      setZone: (zoneId) => ZONE_IDS.has(zoneId) && setOrder((prev) => ({ ...prev, zoneId })),
      dismissNotices: () => setNotices([]),
      // Saves the placed order and empties the basket in one step.
      placeOrder: (placed) => {
        setLastOrder(placed);
        setOrder((prev) => ({ ...prev, items: [] }));
      },
      // Simulated cancellation: the order stays on screen, marked cancelled (Decision D3).
      cancelOrder: () =>
        setLastOrder((prev) => (prev && prev.status === "placed" ? { ...prev, status: "cancelled", cancelledAt: new Date().toISOString() } : prev)),
      clearLastOrder: () => setLastOrder(null),
    };
  }, [order, lastOrder, notices]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const value = useContext(OrderContext);
  if (!value) throw new Error("useOrder must be used inside <OrderProvider>");
  return value;
}
