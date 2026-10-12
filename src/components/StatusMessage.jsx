export default function StatusMessage({ type, message, onRetry }) {
  if (type === "loading") {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{message}</span>
        <div className="skeletons" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div className="sk" key={i}>
              <div className="sk__poster" />
              <div className="sk__line" />
              <div className="sk__line sk__line--short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`status status--${type}`} role={type === "error" ? "alert" : "status"}>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}