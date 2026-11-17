// Safe localStorage helpers. Storage can be blocked, full or hold corrupted text,
// so every access is wrapped and falls back instead of crashing the app.

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage unavailable: the app keeps working without saving
  }
}
