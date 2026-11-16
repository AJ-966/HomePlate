// Business constants for HomePlate. Rules and pricing read from here so the numbers live in one place.

export const CURRENCY = "USD";

// Rule 1: availability / capacity
export const MAX_PER_ORDER = 4;

// Rule 3: fulfilment (slot lead time and cancellation window)
export const SLOT_LEAD_HOURS = 3; // a slot must start at least this long after the order is placed
export const CANCEL_CUTOFF_HOURS = 2; // free cancellation until this long before the slot
export const SLOT_FIRST_HOUR = 11; // first delivery slot starts at 11:00
export const SLOT_LAST_HOUR = 21; // last delivery slot starts at 21:00

// Pricing (all money is stored in integer cents to avoid floating-point errors)
export const SERVICE_FEE_CENTS = 100;

export const ZONES = [
  { id: "inner", label: "Inner zone", description: "Up to 3 miles from the central campus district", feeCents: 250 },
  { id: "outer", label: "Outer zone", description: "3 to 8 miles from the central campus district", feeCents: 400 },
];
export const DEFAULT_ZONE_ID = "inner";

export const CUISINES = ["Pakistani", "Indian", "Italian", "Middle Eastern", "East Asian", "Mexican"];

// Rule 2: dietary requirements a student can select
export const DIET_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal" },
  { id: "nut-free", label: "Nut-free" },
];

export const ALLERGEN_LABELS = {
  dairy: "Dairy",
  gluten: "Gluten",
  egg: "Egg",
  soy: "Soy",
  sesame: "Sesame",
  peanuts: "Peanuts",
  "tree-nuts": "Tree nuts",
};
