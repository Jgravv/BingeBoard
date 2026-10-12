export default function LoadMore({ shown, total, hasMore, loading, onClick }) {
  if (shown >= total && !hasMore) return null;

  return (
    <div className="loadmore">
      <button onClick={onClick} disabled={loading}>
        {loading ? "Loading…" : "Load more"}
      </button>
      <span>
        Showing {shown} of {total}{hasMore ? "+" : ""}
      </span>
    </div>
  );
}