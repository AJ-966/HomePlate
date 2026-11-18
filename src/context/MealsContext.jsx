// Loads the meals once for the whole app and shares them with every page.
// Pages read { status, meals, error, retry } through the useMeals() hook.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadMeals } from "../data/mockApi.js";
import { nowDate } from "../lib/clock.js";
import { readJson } from "../lib/storage.js";
import { applyReserved } from "../rules/stockRule.js";

const MealsContext = createContext(null);

export function MealsProvider({ children }) {
  const [state, setState] = useState({ status: "loading", meals: [], error: "" });
  const [attempt, setAttempt] = useState(0);
  // Placed orders are reported by OrderProvider; their portions are taken off today's stock (stockRule).
  const [orders, setOrders] = useState(() => {
    const saved = readJson("homeplate.orders", []);
    return Array.isArray(saved) ? saved.filter((o) => o && Array.isArray(o.lines)) : [];
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading", error: "" }));

    loadMeals({ signal: controller.signal })
      .then((meals) => setState({ status: "ready", meals, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return; // cancelled by cleanup, not a real failure
        setState({ status: "error", meals: [], error: err.message });
      });

    return () => controller.abort();
  }, [attempt]);

  const value = useMemo(
    () => ({
      ...state,
      meals: applyReserved(state.meals, orders, nowDate()),
      retry: () => setAttempt((n) => n + 1),
      reportOrders: setOrders,
    }),
    [state, orders]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const value = useContext(MealsContext);
  if (!value) throw new Error("useMeals must be used inside <MealsProvider>");
  return value;
}
