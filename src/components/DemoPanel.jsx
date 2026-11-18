import { useState } from "react";
import { useMeals } from "../context/MealsContext.jsx";
import { announceDemoChange, nowDate } from "../lib/clock.js";
import { getDemoSettings, resetDemoSettings, setDemoSettings } from "../lib/demoSettings.js";
import { dayLabel, slotRange } from "../lib/time.js";

// Demo-only controls so a marker can reproduce hard-to-reach states without editing code:
// a menu that fails to load, a meal with changed stock, and a clock that moves forward.
// Settings live in localStorage (see lib/demoSettings.js); the real order logic is untouched.
export default function DemoPanel() {
  const { status, meals, retry } = useMeals();
  const [settings, setSettings] = useState(getDemoSettings);
  const [mealId, setMealId] = useState("");
  const [stock, setStock] = useState("0");

  function update(patch, reloadMenu = false) {
    setSettings(setDemoSettings(patch));
    announceDemoChange();
    if (reloadMenu) retry(); // the menu is loaded again so the change shows
  }

  function reset() {
    resetDemoSettings();
    setSettings(getDemoSettings());
    announceDemoChange();
    retry();
  }

  const now = nowDate();
  const simulated = settings.clockOffsetMinutes > 0;
  const overrides = Object.entries(settings.stockOverrides);
  const stockNumber = Number(stock);
  const stockOk = Number.isInteger(stockNumber) && stockNumber >= 0 && stockNumber <= 50;

  return (
    <details className="demo">
      <summary>Demo controls (for markers)</summary>
      <div className="demo__body">
        <p className="field__help">These only change this browser, to reproduce edge cases. They are not part of the business.</p>

        <label className="check">
          <input type="checkbox" checked={settings.failLoading} onChange={(e) => update({ failLoading: e.target.checked }, true)} />
          <span>Make the menu fail to load</span>
        </label>

        <fieldset className="demo__group">
          <legend>Change a meal’s stock</legend>
          <div className="demo__row">
            <label>
              <span className="demo__label">Meal</span>
              <select value={mealId} onChange={(e) => setMealId(e.target.value)} disabled={status !== "ready"}>
                <option value="">Choose a meal</option>
                {meals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="demo__label">Left today</span>
              <input type="number" min="0" max="50" value={stock} onChange={(e) => setStock(e.target.value)} />
            </label>
            <button
              type="button"
              className="btn btn--quiet"
              disabled={!mealId || !stockOk}
              onClick={() => update({ stockOverrides: { ...settings.stockOverrides, [mealId]: stockNumber } }, true)}
            >
              Apply
            </button>
          </div>
          {overrides.length > 0 && (
            <p className="field__help">Changed: {overrides.map(([id, n]) => `${meals.find((m) => m.id === id)?.name ?? id} (${n})`).join(", ")}</p>
          )}
        </fieldset>

        <fieldset className="demo__group">
          <legend>Clock</legend>
          <p>
            {simulated ? "Simulated time" : "Current time"}: {dayLabel(now, new Date())}, {slotRange(now.toISOString()).split(" to ")[0]}
            {simulated && ` (${settings.clockOffsetMinutes} min ahead)`}
          </p>
          <div className="demo__row">
            {[60, 120, 24 * 60].map((minutes) => (
              <button key={minutes} type="button" className="btn btn--quiet" onClick={() => update({ clockOffsetMinutes: settings.clockOffsetMinutes + minutes })}>
                {minutes === 1440 ? "+1 day" : `+${minutes / 60} h`}
              </button>
            ))}
            <button type="button" className="btn btn--quiet" disabled={!simulated} onClick={() => update({ clockOffsetMinutes: 0 })}>
              Real time
            </button>
          </div>
        </fieldset>

        <button type="button" className="link-quiet" onClick={reset}>
          Reset all demo settings
        </button>
      </div>
    </details>
  );
}
