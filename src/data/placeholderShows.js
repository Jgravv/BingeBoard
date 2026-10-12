
const genres = ["Drama", "Comedy", "Action", "Thriller", "Science-Fiction", "Crime"];

export const placeholderShows = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: `Placeholder Show ${i + 1}`,
  language: "English",
  genres: [genres[i % genres.length], genres[(i + 2) % genres.length]],
  status: i % 3 === 0 ? "Ended" : "Running",
  premiered: `20${10 + (i % 15)}-0${(i % 9) + 1}-1${i % 9}`,
  officialSite: null,
  rating: { average: i % 7 === 0 ? null : +(5 + ((i * 7) % 45) / 10).toFixed(1) },
  image: null,
  summary: "<p>Your show summary will appear here once the API is connected.</p>",
}));
