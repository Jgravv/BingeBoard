export default function LoadMore({ shown, total, onClick }) {
  if (shown >= total) return null;
  return (
    <div className="loadmore">
      <button onClick={onClick}>Load more</button>
      <span>Showing {shown} of {total}</span>
    </div>
  );
}
