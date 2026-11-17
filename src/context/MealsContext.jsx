// Loads the meals once for the whole app and shares them with every page.
// Pages read { status, meals, error, retry } through the useMeals() hook.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadMeals } from "../data/mockApi.js";

const MealsContext = createContext(null);

export function MealsProvider({ children }) {
  const [state, setState] = useState({ status: "loading", meals: [], error: "" });
  const [attempt, setAttempt] = useState(0);

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

  const value = useMemo(() => ({ ...state, retry: () => setAttempt((n) => n + 1) }), [state]);

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const value = useContext(MealsContext);
  if (!value) throw new Error("useMeals must be used inside <MealsProvider>");
  return value;
}
