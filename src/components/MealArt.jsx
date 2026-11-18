import { useState } from "react";
import { MEAL_ART } from "../data/mealArt.js";

export const cuisineSlug = (cuisine) => cuisine.toLowerCase().replace(/\s+/g, "-");

// Draws one shape from the data in mealArt.js.
function Shape({ shape }) {
  const [type, ...a] = shape;
  switch (type) {
    case "c":
      return <circle cx={a[0]} cy={a[1]} r={a[2]} fill={a[3]} />;
    case "e": {
      const [cx, cy, rx, ry, fill, rotate = 0] = a;
      return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} transform={`rotate(${rotate} ${cx} ${cy})`} />;
    }
    case "r": {
      const [x, y, w, h, rx, fill, rotate = 0] = a;
      return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`} />;
    }
    case "p":
      return <path d={a[0]} fill={a[1]} />;
    case "s":
      return <path d={a[0]} fill="none" stroke={a[1]} strokeWidth={a[2]} strokeLinecap="round" />;
    case "o":
      return <circle cx={a[0]} cy={a[1]} r={a[2]} fill="none" stroke={a[3]} strokeWidth={a[4]} />;
    default:
      return null;
  }
}

// A plate on a cuisine-coloured placemat. Use decorative when the meal name is already next to it.
// If the meal has a photo it is shown instead (stock photos are illustrative, see /credits).
// The plate drawing is the fallback when there is no photo or the photo fails to load.
export default function MealArt({ meal, decorative = false }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  if (meal.photo && !photoFailed) {
    return (
      <img
        className="meal-photo"
        src={meal.photo}
        alt={decorative ? "" : `${meal.name} (illustrative photo)`}
        width="1000"
        height="750"
        loading="lazy"
        decoding="async"
        onError={() => setPhotoFailed(true)}
      />
    );
  }

  const shapes = MEAL_ART[meal.id] ?? [];
  const a11y = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": `Illustration of ${meal.name}` };

  return (
    <svg className="meal-art" viewBox="0 0 120 120" focusable="false" {...a11y}>
      <circle cx="60" cy="60" r="58" style={{ fill: `var(--cuisine-${cuisineSlug(meal.cuisine)})` }} />
      <circle cx="62" cy="65" r="43" fill="rgba(58, 29, 63, 0.14)" />
      <circle cx="60" cy="62" r="42" fill="#FFFCF4" />
      <circle cx="60" cy="62" r="34" fill="none" stroke="rgba(58, 29, 63, 0.12)" strokeWidth="1.5" />
      {shapes.map((shape, index) => (
        <Shape key={index} shape={shape} />
      ))}
    </svg>
  );
}
