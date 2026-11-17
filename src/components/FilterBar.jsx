import { CUISINES, DIET_OPTIONS } from "../data/config.js";
import { SORT_OPTIONS } from "../lib/discovery.js";
import { formatCents } from "../lib/format.js";
import { cuisineSlug } from "./MealArt.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";

// All the controls for narrowing the menu. Cuisine, price and sort are filters (FiltersContext);
// dietary needs are the student's preferences (PreferencesContext) because they follow them everywhere.
export default function FilterBar({ priceRange }) {
  const filters = useFilters();
  const { requirements, toggleRequirement } = usePreferences();

  const priceHint = priceRange
    ? `Meals cost ${formatCents(priceRange.min)} to ${formatCents(priceRange.max)}.`
    : "";

  return (
    <div className="filter-bar">
      <div className="field">
        <label htmlFor="meal-search">Search meals</label>
        <input
          id="meal-search"
          type="search"
          value={filters.query}
          onChange={(event) => filters.setQuery(event.target.value)}
          placeholder="Try biryani, vegan or Rosa"
          autoComplete="off"
        />
      </div>

      <fieldset className="field">
        <legend>Cuisine</legend>
        <div className="chip-row">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              className="chip chip--cuisine"
              style={{ "--chip-color": `var(--cuisine-${cuisineSlug(cuisine)})` }}
              aria-pressed={filters.cuisines.includes(cuisine)}
              onClick={() => filters.toggleCuisine(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Dietary needs</legend>
        <div className="chip-row">
          {DIET_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="chip chip--diet"
              aria-pressed={requirements.includes(option.id)}
              onClick={() => toggleRequirement(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.hideUnsuitable}
            disabled={requirements.length === 0}
            onChange={(event) => filters.setHideUnsuitable(event.target.checked)}
          />
          <span>Hide meals that don’t fit</span>
        </label>
      </fieldset>

      <fieldset className="field">
        <legend>Price in US dollars</legend>
        <div className="price-row">
          <div>
            <label htmlFor="price-min">From</label>
            <input
              id="price-min"
              type="text"
              inputMode="decimal"
              value={filters.minText}
              onChange={(event) => filters.setMinText(event.target.value)}
              placeholder="8"
              aria-invalid={filters.priceMessage ? "true" : "false"}
              aria-describedby="price-help"
            />
          </div>
          <div>
            <label htmlFor="price-max">To</label>
            <input
              id="price-max"
              type="text"
              inputMode="decimal"
              value={filters.maxText}
              onChange={(event) => filters.setMaxText(event.target.value)}
              placeholder="12"
              aria-invalid={filters.priceMessage ? "true" : "false"}
              aria-describedby="price-help"
            />
          </div>
        </div>
        <p id="price-help" className={filters.priceMessage ? "field__help field__help--error" : "field__help"}>
          {filters.priceMessage || priceHint}
        </p>
      </fieldset>

      <div className="field">
        <label htmlFor="meal-sort">Sort by</label>
        <select id="meal-sort" value={filters.sort} onChange={(event) => filters.setSort(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
