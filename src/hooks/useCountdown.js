import { useEffect, useState } from "react";
import { nowMs, subscribeDemoChange } from "../lib/clock.js";

// Milliseconds left until `targetIso`, updated every second.
// It reads the real clock each tick instead of subtracting 1000, so it cannot drift, and it stops
// ticking once the time is reached. The interval is cleared when the component unmounts or the target changes.
export function useCountdown(targetIso) {
  const target = targetIso ? new Date(targetIso).getTime() : 0;
  const [msLeft, setMsLeft] = useState(() => Math.max(0, target - nowMs()));
  const [version, setVersion] = useState(0); // bumped when the demo clock moves, to restart the timer
  useEffect(() => subscribeDemoChange(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    setMsLeft(Math.max(0, target - nowMs()));
    if (!target || target <= nowMs()) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, target - nowMs());
      setMsLeft(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target, version]);

  return { msLeft, expired: msLeft === 0 };
}
