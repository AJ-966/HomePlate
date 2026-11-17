// Browse filters (search text, cuisines, price range, sort). They live above the router so the
// student's choices survive opening a meal and pressing Back.

import { createContext, useContext, useMemo, useState } from "react";
import { deriveFilters } from "../lib/discovery.js";

const INITIAL_FILTERS = {
  query: "",
  cuisines: [],
  minText: "", // price boxes keep the raw typed text; deriveFilters() works out what it means
  maxText: "",
  sort: "recommended",
  hideUnsuitable: false,
};

function removeOne(filters, id) {
  if (id === "q") return { ...filters, query: "" };
  if (id === "min") return { ...filters, minText: "" };
  if (id === "max") return { ...filters, maxText: "" };
  if (id === "hide") return { ...filters, hideUnsuitable: false };
  if (id.startsWith("cuisine:")) {
    const cuisine = id.slice("cuisine:".length);
    return { ...filters, cuisines: filters.cuisines.filter((c) => c !== cuisine) };
  }
  return filters;
}

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const actions = useMemo(
    () => ({
      setQuery: (query) => setFilters((f) => ({ ...f, query })),
      toggleCuisine: (cuisine) =>
        setFilters((f) => ({
          ...f,
          cuisines: f.cuisines.includes(cuisine) ? f.cuisines.filter((c) => c !== cuisine) : [...f.cuisines, cuisine],
        })),
      setMinText: (minText) => setFilters((f) => ({ ...f, minText })),
      setMaxText: (maxText) => setFilters((f) => ({ ...f, maxText })),
      setSort: (sort) => setFilters((f) => ({ ...f, sort })),
      setHideUnsuitable: (hideUnsuitable) => setFilters((f) => ({ ...f, hideUnsuitable })),
      removeFilter: (id) => setFilters((f) => removeOne(f, id)),
      clearAll: () => setFilters(INITIAL_FILTERS),
    }),
    []
  );

  const derived = useMemo(() => deriveFilters(filters), [filters]);
  const value = useMemo(() => ({ ...filters, ...derived, ...actions }), [filters, derived, actions]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters must be used inside <FiltersProvider>");
  return value;
}
