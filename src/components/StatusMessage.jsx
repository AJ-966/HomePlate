// Loading, error and empty states, written to say what happened and what to do next.

export function LoadingGrid({ count = 6 }) {
  return (
    <div aria-busy="true">
      <p role="status" className="state__loading">
        Loading meals…
      </p>
      <div className="meal-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton">
            <div className="skeleton__art" />
            <div className="skeleton__line" />
            <div className="skeleton__line skeleton__line--short" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">The menu didn’t load</h2>
      <p>{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="state">
      <h2 className="state__title">{title}</h2>
      {children}
      {action}
    </div>
  );
}
