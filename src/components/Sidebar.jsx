const BROWSE = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "top", label: "Top rated" },
];

export default function Sidebar({ browse, onBrowse, genres, genre, onGenre }) {
  return (
    <>
      <div className="tabs" aria-label="Browse">
        {BROWSE.map((b) => (
          <button
            key={b.id}
            className={browse === b.id ? "active" : ""}
            aria-pressed={browse === b.id}
            onClick={() => onBrowse(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="chips" aria-label="Genres">
        <button
          className={`chip ${genre === "" ? "active" : ""}`}
          aria-pressed={genre === ""}
          onClick={() => onGenre("")}
        >
          All genres
        </button>
        {genres.map((g) => (
          <button
            key={g}
            className={`chip ${genre === g ? "active" : ""}`}
            aria-pressed={genre === g}
            onClick={() => onGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>
    </>
  );
}