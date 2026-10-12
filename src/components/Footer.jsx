import { useState } from "react";

export default function Footer() {
  const [failed, setFailed] = useState(false);

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noreferrer"
          aria-label="The Movie Database (TMDB)"
          className="footer__link"
        >
          {failed ? (
            "TMDB"
          ) : (
            <img
              className="footer__logo"
              src="/tmdb-logo.svg"
              alt="TMDB"
              onError={() => setFailed(true)}
            />
          )}
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  );
}