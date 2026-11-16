// Demo-only settings (labelled "Demo only" in the interface).
// They let a marker reproduce a loading failure and changed stock without editing code.
// Stored in localStorage; every access is wrapped because storage can be unavailable or throw.

const KEY = "homeplate.demo";
const DEFAULTS = { failLoading: false, stockOverrides: {} };

export function getDemoSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS, stockOverrides: {} };
    const parsed = JSON.parse(raw);
    return {
      failLoading: parsed.failLoading === true,
      stockOverrides: parsed.stockOverrides && typeof parsed.stockOverrides === "object" ? parsed.stockOverrides : {},
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
