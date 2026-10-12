import SearchBar from "./SearchBar";

export default function Header({ query, onQueryChange }) {
  return (
    <header className="header">
      <div className="header__inner container">
        <div className="logo">
          <span className="logo__mark" aria-hidden="true" />
          <span>BingeBoard</span>
        </div>
        <SearchBar value={query} onChange={onQueryChange} />
      </div>
    </header>
  );
}