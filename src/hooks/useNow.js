import { useEffect, useState } from "react";
import { nowDate, subscribeDemoChange } from "../lib/clock.js";

// The current time as state, refreshed on an interval so slot lists stay correct while a page stays open.
// The interval is cleared when the component unmounts.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => nowDate());
  useEffect(() => {
    const id = setInterval(() => setNow(nowDate()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  useEffect(() => subscribeDemoChange(() => setNow(nowDate())), []); // demo clock moved
  return now;
}
