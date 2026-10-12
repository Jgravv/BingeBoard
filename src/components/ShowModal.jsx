import { useEffect, useState } from "react";
import { getShowDetails } from "../api/tmdb";

const money = (n) =>
  n > 0
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : null;

const runtime = (min) => (min ? `${Math.floor(min / 60)}h ${min % 60}m` : null);

function Trailer({ videoKey, title }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="trailer">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button className="trailer__thumb" onClick={() => setPlaying(true)} aria-label={`Play ${title} trailer`}>
          <img src={`https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="trailer__play" aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  );
}

export default function ShowModal({ show, onClose, onSelectPerson }) {
  const [details, setDetails] = useState(show);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getShowDetails(show.type, show.id)
      .then((d) => !ignore && d && setDetails(d))
      .catch(() => {})
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [show.id]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const d = details;
  const rating = d.rating?.average;

const stats = [
  ["Release date", d.premiered],
  ["Runtime", runtime(d.runtime)],
  ["Seasons", d.seasons],
  ["Episodes", d.episodes],
  ["Status", d.status],
  ["Language", d.language],
  ["Director", d.director],
  ["Creator", d.creator],
  ["Budget", money(d.budget)],
  ["Revenue", money(d.revenue)],
].filter(([, value]) => value);

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={d.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>

        {/* Left column: poster + facts */}
        <aside className="modal__side">
          {d.image?.original ? (
            <img className="modal__img" src={d.image.original} alt={`${d.name} poster`} />
          ) : (
            <div className="modal__img modal__img--empty">No poster</div>
          )}

          <dl className="stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {d.officialSite && (
              <div>
                <dt>Website</dt>
                <dd><a href={d.officialSite} target="_blank" rel="noreferrer">Visit site</a></dd>
              </div>
            )}
          </dl>
        </aside>

        {/* Right column: story, trailer, production, cast */}
        <div className="modal__content">
          <h2 className="modal__title">{d.name}</h2>
          {d.tagline && <p className="modal__tagline">{d.tagline}</p>}

          <div className="modal__tags">
            {rating != null && (
              <span className="pill pill--rating">
                <span>★</span> {rating.toFixed(1)}
                {d.voteCount > 0 && <small> ({d.voteCount.toLocaleString()})</small>}
              </span>
            )}
            {d.genres?.map((g) => <span className="pill" key={g}>{g}</span>)}
          </div>

          <div
            className="modal__summary"
            dangerouslySetInnerHTML={{ __html: d.summary || "<p>No summary available.</p>" }}
          />

          {d.trailerKey && (
            <section className="modal__section">
              <h3>Trailer</h3>
              <Trailer videoKey={d.trailerKey} title={d.name} />
            </section>
          )}

          {d.companies?.length > 0 && (
            <section className="modal__section">
              <h3>Production</h3>
              <div className="modal__tags">
                {d.companies.map((c) => <span className="pill" key={c}>{c}</span>)}
              </div>
            </section>
          )}

                  {loading && <p className="modal__loading">Loading more details…</p>}

          {d.cast?.length > 0 && (
            <section className="modal__section cast">
              <h3>Top cast</h3>
              <ul>
                {d.cast.map((c) => (
                  <li key={c.id}>
                    <button
                      className="cast__item"
                      onClick={() => onSelectPerson(c.id)}
                      aria-label={`View ${c.name}`}
                    >
                      {c.photo ? (
                        <img src={c.photo} alt="" loading="lazy" />
                      ) : (
                        <div className="cast__empty" aria-hidden="true">{c.name[0]}</div>
                      )}
                      <strong>{c.name}</strong>
                      <span>{c.character}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
      