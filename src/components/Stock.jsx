// "6 left today", "Only 2 left today" or "Sold out today". Rule 1 (milestone 3) enforces the limit;
// this just tells the student where they stand.
export default function Stock({ remaining }) {
  if (remaining === 0) return <p className="stock stock--out">Sold out today</p>;
  if (remaining <= 3) return <p className="stock stock--low">Only {remaining} left today</p>;
  return <p className="stock">{remaining} left today</p>;
}
