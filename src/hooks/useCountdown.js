import { useEffect, useState } from "react";

// Milliseconds left until `targetIso`, updated every second.
// It reads the real clock each tick instead of subtracting 1000, so it cannot drift, and it stops
// ticking once the time is reached. The interval is cleared when the component unmounts or the target changes.
export function useCountdown(targetIso) {
  const target = targetIso ? new Date(targetIso).getTime() : 0;
  const [msLeft, setMsLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    setMsLeft(Math.max(0, target - Date.now()));
    if (!target || target <= Date.now()) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, target - Date.now());
      setMsLeft(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { msLeft, expired: msLeft === 0 };
}
