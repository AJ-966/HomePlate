// The student's dietary requirements. They apply across the whole app (browse, details and,
// from milestone 3, the order), so they live in context and are saved in localStorage.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DIET_OPTIONS } from "../data/config.js";
import { readJson, writeJson } from "../lib/storage.js";

const STORAGE_KEY = "homeplate.preferences";
const VALID_IDS = new Set(DIET_OPTIONS.map((option) => option.id));

const PreferencesContext = createContext(null);

function loadRequirements() {
  const saved = readJson(STORAGE_KEY, {});
  // Stored text is untrusted: keep only ids we recognise.
  return Array.isArray(saved.requirements) ? saved.requirements.filter((id) => VALID_IDS.has(id)) : [];
}

export function PreferencesProvider({ children }) {
  const [requirements, setRequirements] = useState(loadRequirements); // lazy initial value

  useEffect(() => {
    writeJson(STORAGE_KEY, { requirements });
  }, [requirements]);

  const value = useMemo(
    () => ({
      requirements,
      toggleRequirement: (id) =>
        setRequirements((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      clearRequirements: () => setRequirements([]),
    }),
    [requirements]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return value;
}
