// Asynchronous mock loader. Simulates a network call to a meals endpoint using local data.
// - Resolves with the meals plus remainingStock for today.
// - Rejects when the "simulate loading failure" demo setting is on.
// - Supports an AbortSignal so a React effect can cancel it in its cleanup.

import { MEALS } from "./meals.js";
import { getDemoSettings } from "../lib/demoSettings.js";

const LOAD_DELAY_MS = 700;

export function loadMeals({ signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Loading was cancelled.", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      const { failLoading, stockOverrides } = getDemoSettings();
      if (failLoading) {
        reject(new Error("We couldn't load the meals. Please try again."));
        return;
      }
      resolve(
        MEALS.map((meal) => {
          const override = stockOverrides[meal.id];
          const remaining = Number.isInteger(override) ? override : meal.dailyStock;
          return { ...meal, remainingStock: Math.max(0, remaining) };
        })
      );
    }, LOAD_DELAY_MS);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Loading was cancelled.", "AbortError"));
    });
  });
}
