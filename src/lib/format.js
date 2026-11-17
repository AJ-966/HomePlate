// Money helpers. All prices are stored as integer cents; they become dollars only for display.

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// 1100 -> "$11.00"
export function formatCents(cents) {
  return usd.format(cents / 100);
}

// 1100 -> "$11", 1050 -> "$10.50" (used on the small price sticker)
export function formatCentsShort(cents) {
  return cents % 100 === 0 ? `$${cents / 100}` : formatCents(cents);
}

// Parses text typed into a price box.
// Returns { status: "empty" } | { status: "ok", cents } | { status: "invalid" }
export function parseDollarsToCents(text) {
  const cleaned = String(text ?? "").trim().replace(/^\$/, "");
  if (cleaned === "") return { status: "empty" };
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { status: "invalid" };
  return { status: "ok", cents: Math.round(parseFloat(cleaned) * 100) };
}
