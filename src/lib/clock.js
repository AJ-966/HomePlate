// The app's "now". Normally the real time; the demo panel can move it forward so a marker can
// see a cancellation deadline pass without waiting. Everything time-related reads the clock from here.

import { getDemoSettings } from "./demoSettings.js";

export function nowMs() {
  return Date.now() + getDemoSettings().clockOffsetMinutes * 60 * 1000;
}

export function nowDate() {
  return new Date(nowMs());
}

// Demo controls tell the rest of the app that the clock (or another demo setting) changed.
const EVENT = "homeplate:demo-changed";
export function announceDemoChange() {
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeDemoChange(callback) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
