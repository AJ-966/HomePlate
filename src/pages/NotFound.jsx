import { Link } from "react-router-dom";
import { EmptyState } from "../components/StatusMessage.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="container details">
      <EmptyState
        title="That page isn’t on the menu"
        action={
          <Link to="/meals" className="btn btn--primary">
            Browse meals
          </Link>
        }
      >
        <p>The address may have a typo, or the page may have moved.</p>
      </EmptyState>
    </div>
  );
}
