import { useMemo, useState } from "react";
import FilterBar from "../components/FilterBar.jsx";
import MealCard from "../components/MealCard.jsx";
import { EmptyState, ErrorMessage, LoadingGrid } from "../components/StatusMessage.jsx";
import { useMeals } from "../context/MealsContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { filterMeals, sortMeals } from "../lib/discovery.js";
import { checkMealAgainstDiet } from "../rules/dietaryRule.js";

export default function Browse() {
  useDocumentTitle("Meals");

  const { status, meals, error, retry } = useMeals();
  const filters = useFilters();
  const { requirements } = usePreferences();
  const [panelOpen, setPanelOpen] = useState(false); // only matters on small screens

  // Derived data: recalculated only when one of its inputs changes.
  const visibleMeals = useMemo(() => {
    const matching = filterMeals(meals, {
      query: filters.query,
      cuisines: filters.cuisines,
      minCents: filters.minCents,
      maxCents: filters.maxCents,
      requirements,
      hideUnsuitable: filters.hideUnsuitable,
    });
    return sortMeals(matching, filters.sort);
  }, [meals, filters.query, filters.cuisines, filters.minCents, filters.maxCents, filters.hideUnsuitable, filters.sort, requirements]);

  const priceRange = useMemo(() => {
    if (meals.length === 0) return null;
    const prices = meals.map((meal) => meal.priceCents);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [meals]);

  const activeCount = filters.activeFilters.length;
  const searchText = filters.query.trim();

  return (
    <div className="container browse">
      <h1 className="page-title">Meals from home kitchens</h1>

      <div className="browse__layout">
        <aside className="filters" aria-label="Filters">
          <button
            type="button"
            className="btn btn--quiet filters__toggle"
            aria-expanded={panelOpen}
            aria-controls="filters-panel"
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelOpen ? "Hide filters" : "Show filters"}
            {activeCount > 0 ? ` (${activeCount} on)` : ""}
          </button>
          <div id="filters-panel" className={panelOpen ? "filters__panel is-open" : "filters__panel"}>
            <FilterBar priceRange={priceRange} />
          </div>
        </aside>

        <section className="browse__results" aria-label="Results">
          {status === "loading" && <LoadingGrid />}

          {status === "error" && <ErrorMessage message={error} onRetry={retry} />}

          {status === "ready" && meals.length === 0 && (
            <EmptyState title="The menu is empty right now">
              <p>The cooks haven’t listed any meals yet. Check back soon.</p>
            </EmptyState>
          )}

          {status === "ready" && meals.length > 0 && (
            <>
              <div className="results-bar">
                <p className="results-bar__count" role="status">
                  Showing {visibleMeals.length} of {meals.length} meals
                </p>
                {activeCount > 0 && (
                  <button type="button" className="btn btn--quiet" onClick={filters.clearAll}>
                    Clear all filters
                  </button>
                )}
              </div>

              {activeCount > 0 && (
                <ul className="active-filters" aria-label="Active filters">
                  {filters.activeFilters.map((filter) => (
                    <li key={filter.id}>
                      <button
                        type="button"
                        className="chip chip--removable"
                        aria-label={`Remove filter: ${filter.label}`}
                        onClick={() => filters.removeFilter(filter.id)}
                      >
                        {filter.label}
                        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                          <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {visibleMeals.length === 0 ? (
                <EmptyState
                  title={searchText ? `No meals match “${searchText}”` : "No meals fit these filters"}
                  action={
                    <button type="button" className="btn btn--primary" onClick={filters.clearAll}>
                      Clear all filters
                    </button>
                  }
                >
                  <p>Check the spelling, remove a filter or widen the price range.</p>
                </EmptyState>
              ) : (
                <ul className="meal-grid">
                  {visibleMeals.map((meal) => (
                    <li key={meal.id}>
                      <MealCard meal={meal} suitability={checkMealAgainstDiet(meal, requirements)} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
