import { useMemo, useState } from "react";
import useShows from "./hooks/useShows";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FilterControls from "./components/FilterControls";
import ShowGrid from "./components/ShowGrid";
import StatusMessage from "./components/StatusMessage";
import LoadMore from "./components/LoadMore";
import ShowModal from "./components/ShowModal";
import Footer from "./components/Footer";
import PersonModal from "./components/PersonModal";
import useModalHistory from "./hooks/useModalHistory";
const PAGE_SIZE = 12;

export default function App() {
  const [query, setQuery] = useState("");
  const [browse, setBrowse] = useState("popular");
  const [genre, setGenre] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("none");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState("movie");
  const [personId, setPersonId] = useState(null);
  const openCount = (selected ? 1 : 0) + (personId ? 1 : 0);
  const closeTop = () => (personId ? setPersonId(null) : setSelected(null));
  useModalHistory(openCount, closeTop);

  const { shows, loading, loadingMore, error, hasMore, loadMore } = useShows(query, browse, type);
  const genres = useMemo(
    () => [...new Set(shows.flatMap((s) => s.genres || []))].sort(),
    [shows]
  );

  const results = useMemo(() => {
    let list = shows;
    if (genre) list = list.filter((s) => s.genres?.includes(genre));
    if (minRating) list = list.filter((s) => (s.rating?.average ?? 0) >= minRating);

    const byRating = (s) => s.rating?.average;
    if (browse === "top" && sort === "none") {
      list = [...list].sort((a, b) => (byRating(b) ?? -1) - (byRating(a) ?? -1));
    }
    if (browse === "newest" && sort === "none") {
      list = [...list].sort((a, b) => (b.premiered || "").localeCompare(a.premiered || ""));
    }
    if (sort !== "none") {
      const dir = sort === "rating-desc" ? -1 : 1;
      list = [...list].sort((a, b) => {
        const x = byRating(a), y = byRating(b);
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x - y) * dir;
      });
    }
    return list;
  }, [shows, genre, minRating, sort, browse]);

  const resetVisible = (fn) => (v) => { fn(v); setVisible(PAGE_SIZE); };

  const handleLoadMore = () => {
  const next = visible + PAGE_SIZE;
  setVisible(next);
  if (hasMore && next > results.length - PAGE_SIZE) loadMore();
};
  const goHome = () => {
    setQuery("");
    setBrowse("popular");
    setGenre("");
    setMinRating(0);
    setSort("none");
    setType("movie");
    setVisible(PAGE_SIZE);
    setSelected(null);
    setPersonId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeType = (t) => { setType(t); setGenre(""); setVisible(PAGE_SIZE); };

  const label = type === "movie" ? "movies" : "TV shows";
  const title = query.trim() ? `Results for “${query.trim()}”` : `Discover ${label}`;

  return (
    <div className="app">
      <Header query={query} onQueryChange={resetVisible(setQuery)} onHome={goHome} />
      <main className="container">
        <section className="hero">
          <h1>{title}</h1>
          <p className="hero__count">
            {!loading && !error && `${results.length}${hasMore ? "+" : ""} ${results.length === 1 ? "show" : "shows"}`}          </p>
          <div className="tabs" aria-label="Content type">
            <button className={type === "movie" ? "active" : ""} onClick={() => changeType("movie")}>
              Movies
            </button>
            <button className={type === "tv" ? "active" : ""} onClick={() => changeType("tv")}>
              TV shows
            </button>
          </div>
        </section>

        <div className="toolbar">
          <Sidebar
            browse={browse}
            onBrowse={resetVisible(setBrowse)}
            genres={genres}
            genre={genre}
            onGenre={resetVisible(setGenre)}
          />


          <FilterControls
            minRating={minRating}
            onMinRating={resetVisible(setMinRating)}
            sort={sort}
            onSort={resetVisible(setSort)}
          />
        </div>


        {loading && <StatusMessage type="loading" message="Loading shows" />}
        {!loading && error && (
          <StatusMessage type="error" message={error} onRetry={() => setQuery((q) => q + " ")} />
        )}
        {!loading && !error && results.length === 0 && (
          <StatusMessage type="empty" message="No shows match your search or filters. Try clearing a filter." />
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <ShowGrid shows={results.slice(0, visible)} onSelect={setSelected} />
            <LoadMore
              shown={Math.min(visible, results.length)}
              total={results.length}
              hasMore={hasMore}
              loading={loadingMore}
              onClick={handleLoadMore}
            />
          </>
        )}
      </main>

      {selected && (
        <ShowModal
          key={`${selected.type}-${selected.id}`}
          show={selected}
          onClose={() => setSelected(null)}
          onSelectPerson={setPersonId}
        />
      )}

      {personId && (
        <PersonModal
          id={personId}
          onClose={() => setPersonId(null)}
          onSelectShow={(s) => { setPersonId(null); setSelected(s); }}
        />
      )}
      <Footer />

    </div>
  );
}