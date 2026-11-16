// Milestone 1 placeholder: proves the project runs and the async mock loader works
// (loading, error and retry). Routing, pages and styling arrive in the next milestone.

import { useEffect, useState } from "react";
import { loadMeals } from "./data/mockApi.js";

export default function App() {
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    loadMeals({ signal: controller.signal })
      .then((data) => {
        setMeals(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // effect cleaned up; ignore
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <main className="shell">
      <h1>HomePlate</h1>
      <p>Home-cooked meals for university students. Setup check (milestone 1).</p>

      {status === "loading" && <p role="status">Loading meals…</p>}

      {status === "error" && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Retry
          </button>
        </div>
      )}

      {status === "ready" && <p role="status">{meals.length} meals loaded.</p>}
    </main>
  );
}
