// Demo-only settings (failure switch, stock overrides, a clock that can move forward) (labelled "Demo only" in the interface).
// They let a marker reproduce a loading failure and changed stock without editing code.
// Stored in localStorage; every access is wrapped because storage can be unavailable or throw.

const KEY = "homeplate.demo";
const DEFAULTS = { failLoading: false, stockOverrides: {}, clockOffsetMinutes: 0 };
const MAX_OFFSET_MINUTES = 7 * 24 * 60; // the demo clock can move up to a week forward

export function getDemoSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS, stockOverrides: {} };
    const parsed = JSON.parse(raw);
    return {
      failLoading: parsed.failLoading === true,
      stockOverrides: parsed.stockOverrides && typeof parsed.stockOverrides === "object" ? parsed.stockOverrides : {},
      clockOffsetMinutes: Number.isFinite(parsed.clockOffsetMinutes)
        ? Math.min(MAX_OFFSET_MINUTES, Math.max(0, Math.round(parsed.clockOffsetMinutes)))
        : 0,
    };
  } catch {
    return { ...DEFAULTS, stockOverrides: {} };
  }
}

export function setDemoSettings(patch) {
  const next = { ...getDemoSettings(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: the demo control simply has no effect.
  }
  return next;
}

export function resetDemoSettings() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to reset if storage is unavailable
  }
}
