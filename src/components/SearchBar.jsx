export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="text"
        placeholder="Search TV shows by title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search TV shows"
      />
      {value && (
        <button className="search__clear" onClick={() => onChange("")} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
