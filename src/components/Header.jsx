import SearchBar from "./SearchBar";

export default function Header({ query, onQueryChange, onHome }) {
  return (
    <header className="header">
      <div className="header__inner container">
        <a
          className="logo"
          href="/"
          aria-label="BingeBoard home"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
        >
          <span className="logo__mark" aria-hidden="true" />
          <span>BingeBoard</span>
        </a>
        <SearchBar value={query} onChange={onQueryChange} />
      </div>
    </header>
  );
}