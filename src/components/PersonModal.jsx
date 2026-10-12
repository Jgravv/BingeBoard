import { useEffect, useState } from "react";
import { getPersonDetails } from "../api/tmdb";

const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

const age = (birthday, deathday) => {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const b = new Date(birthday);
  let a = end.getFullYear() - b.getFullYear();
  if (end < new Date(end.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};

export default function PersonModal({ id, onClose, onSelectShow }) {
  const [person, setPerson] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let ignore = false;
    setPerson(null);
    setError("");
    getPersonDetails(id)
      .then((p) => !ignore && setPerson(p))
      .catch((e) => !ignore && setError(e.message || "Could not load this person."));
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const credits = person?.credits || [];
  const movies = credits.filter((c) => c.type === "movie");
  const tv = credits.filter((c) => c.type === "tv");
  const list = filter === "movie" ? movies : filter === "tv" ? tv : credits;

  const facts = person
    ? [
        ["Known for", person.department],
        ["Born", formatDate(person.birthday)],
        ["Died", formatDate(person.deathday)],
        ["Age", age(person.birthday, person.deathday)],
        ["Birthplace", person.birthplace],
      ].filter(([, v]) => v)
    : [];

  const longBio = person?.biography.length > 600;

  return (
    <div className="modal modal--top" onClick={onClose}>
      <div
        className="modal__panel person"
        role="dialog"
        aria-modal="true"
        aria-label={person?.name || "Person details"}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>

        {error && <p className="person__state">{error}</p>}
        {!error && !person && <p className="person__state">Loading…</p>}

        {person && (
          <>
            <aside className="modal__side">
              {person.photo ? (
                <img className="modal__img" src={person.photo} alt={person.name} />
              ) : (
                <div className="modal__img modal__img--empty">No photo</div>
              )}
              <dl className="stats">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>

            <div className="modal__content">
              <h2 className="modal__title">{person.name}</h2>

              <div className="modal__summary person__bio">
                {person.biography ? (
                  <p className={longBio && !expanded ? "clamp" : ""}>{person.biography}</p>
                ) : (
                  <p>No biography available.</p>
                )}
                {longBio && (
                  <button className="person__more" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              <section className="modal__section">
                <h3>Appears in</h3>
                <div className="tabs" aria-label="Filter credits">
                  <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                    All ({credits.length})
                  </button>
                  <button className={filter === "movie" ? "active" : ""} onClick={() => setFilter("movie")}>
                    Movies ({movies.length})
                  </button>
                  <button className={filter === "tv" ? "active" : ""} onClick={() => setFilter("tv")}>
                    TV shows ({tv.length})
                  </button>
                </div>

                {list.length === 0 ? (
                  <p className="modal__loading">No credits found.</p>
                ) : (
                  <ul className="credits">
                    {list.map((c) => (
                      <li key={`${c.type}-${c.id}`}>
                        <button onClick={() => onSelectShow(c)}>
                          <img src={c.image.medium} alt={`${c.name} poster`} loading="lazy" />
                          <strong>{c.name}</strong>
                          <span>
                            {[c.premiered?.slice(0, 4), c.character].filter(Boolean).join(" · ")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}