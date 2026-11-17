import { useEffect } from "react";

// Sets the browser tab title for the current page, e.g. "Pad Thai | HomePlate".
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | HomePlate` : "HomePlate | Home-cooked meals for students";
  }, [title]);
}
