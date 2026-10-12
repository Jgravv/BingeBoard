export default function ShowCard({ show, onSelect }) {
  const rating = show.rating?.average;
  const poster = show.image?.medium;
  const year = show.premiered?.slice(0, 4);
  const genres = show.genres?.slice(0, 2).join(", ");

  return (
    <article
      className="card"
      tabIndex={0}
      onClick={() => onSelect(show)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(show)}
    >
      <div className="card__poster">
        {poster ? (
          <img className="card__img" src={poster} alt={`${show.name} poster`} loading="lazy" />
        ) : (
          <div className="card__empty">No poster</div>
        )}
        {rating != null && (
          <span className="badge">
            <span className="badge__star">★</span>
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      <div>
        <h3>{show.name}</h3>
        <p className="card__meta">{[year, genres].filter(Boolean).join(" · ") || "No details"}</p>
      </div>
    </article>
  );
}