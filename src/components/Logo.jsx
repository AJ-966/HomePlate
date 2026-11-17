import { Link } from "react-router-dom";

// A plate under a little roof: "home" + "plate".
export default function Logo() {
  return (
    <Link to="/" className="logo">
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M6 15 L20 4 L34 15" fill="none" stroke="var(--persimmon)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="26" r="12" fill="var(--milk)" stroke="var(--ink)" strokeWidth="2.5" />
        <circle cx="20" cy="26" r="6.5" fill="var(--marigold)" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <span className="logo__word">HomePlate</span>
    </Link>
  );
}
