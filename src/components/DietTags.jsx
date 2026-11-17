const TAG_LABELS = { halal: "Halal", vegetarian: "Vegetarian", vegan: "Vegan" };

export default function DietTags({ tags }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tag-list" aria-label="Dietary tags">
      {tags.map((tag) => (
        <li key={tag} className="tag">
          {TAG_LABELS[tag] ?? tag}
        </li>
      ))}
    </ul>
  );
}
