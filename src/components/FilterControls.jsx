export default function FilterControls({ minRating, onMinRating, sort, onSort }) {
  return (
    <div className="filters">
      <label>
        Rating
        <select value={minRating} onChange={(e) => onMinRating(Number(e.target.value))}>
          <option value={0}>Any</option>
          <option value={7}>7.0+</option>
          <option value={8}>8.0+</option>
          <option value={9}>9.0+</option>
        </select>
      </label>

      <label>
        Sort
        <select value={sort} onChange={(e) => onSort(e.target.value)}>
          <option value="none">Default</option>
          <option value="rating-desc">Highest rated</option>
          <option value="rating-asc">Lowest rated</option>
        </select>
      </label>
    </div>
  );
}