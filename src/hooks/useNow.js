import { useEffect, useState } from "react";

// The current time as state, refreshed on an interval so slot lists stay correct while a page stays open.
// The interval is cleared when the component unmounts.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
