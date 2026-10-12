import { useEffect, useState } from "react";
import { getShowDetails } from "../api/tmdb";

export default function ShowModal({ show, onClose }) {
  const [details, setDetails] = useState(show);

  useEffect(() => {
    let ignore = false;
    getShowDetails(show.id)
      .then((d) => !ignore && d && setDetails(d))
      .catch(() => {}); 
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

        {d.image?.original ? (
          <img className="modal__img" src={d.image.original} alt={`${d.name} poster`} />
        ) : (
          <div className="modal__img modal__img--empty">No poster</div>
        )}

        <div className="modal__content">
          <h2 className="modal__title">{d.name}</h2>

          <div className="modal__tags">
            {rating != null && (
              <span className="pill pill--rating"><span>★</span> {rating.toFixed(1)}</span>
            )}
            {d.genres?.map((g) => <span className="pill" key={g}>{g}</span>)}
          </div>

          <div
            className="modal__summary"
            dangerouslySetInnerHTML={{ __html: d.summary || "<p>No summary available.</p>" }}
          />

          <dl className="stats">
            <div><dt>Premiered</dt><dd>{d.premiered || "—"}</dd></div>
            <div><dt>Status</dt><dd>{d.status || "—"}</dd></div>
            <div><dt>Language</dt><dd>{d.language || "—"}</dd></div>
            <div>
              <dt>Website</dt>
              <dd>
                {d.officialSite
                  ? <a href={d.officialSite} target="_blank" rel="noreferrer">Visit site</a>
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}