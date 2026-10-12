export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noreferrer"
          aria-label="The Movie Database (TMDB)"
        >
         <img
  className="footer__logo"
  src="https://www.themoviedb.org/assets/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
  alt="TMDB"
/>
        </a>
        <p>
          This website uses TMDB and the TMDB APIs but is not endorsed, certified,
          or otherwise approved by TMDB.
        </p>
      </div>
    </footer>
  );
}