// Shows loading / error / empty states; renders children when there is data.
export default function StateView({ loading, error, empty, emptyTitle, emptyText, onRetry, children }) {
  if (loading) return <div className="state"><div className="spinner" /><p>Loading…</p></div>;
  if (error) {
    return (
      <div className="state">
        <h3>Couldn’t load this data</h3>
        <p>{error}</p>
        {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  if (empty) return <div className="state"><h3>{emptyTitle}</h3><p>{emptyText}</p></div>;
  return children;
}
