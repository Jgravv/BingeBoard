import ShowCard from "./ShowCard";

export default function ShowGrid({ shows, onSelect }) {
  return (
    <section className="grid">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} onSelect={onSelect} />
      ))}
    </section>
  );
}
