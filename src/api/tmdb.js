const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const IMG = "https://image.tmdb.org/t/p";

async function request(path, params = {}) {
  const qs = new URLSearchParams({ api_key: API_KEY, ...params });
  const res = await fetch(`${BASE_URL}${path}?${qs}`);
  if (!res.ok) throw new Error(`Request failed (${res.status}). Please try again.`);
  return res.json();
}

let genreMap = null;
async function getGenreMap() {
  if (!genreMap) {
    const data = await request("/genre/movie/list");
    genreMap = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
  }
  return genreMap;
}

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function normalize(m, genreNames = []) {
  return {
    id: m.id,
    name: m.title,
    language: m.original_language,
    genres: genreNames,
    premiered: m.release_date || "",
    status: m.status || "",
    officialSite: m.homepage || null,
    rating: { average: m.vote_count > 0 ? m.vote_average : null },
    image: m.poster_path
      ? { medium: `${IMG}/w342${m.poster_path}`, original: `${IMG}/w780${m.poster_path}` }
      : null,
    summary: m.overview ? `<p>${escapeHtml(m.overview)}</p>` : "",
  };
}

const CATEGORY = { popular: "popular", newest: "upcoming", top: "top_rated" };

export async function getShows(browse = "popular", pages = 5) {
  const map = await getGenreMap();
  const endpoint = `/movie/${CATEGORY[browse] || "popular"}`;
  const responses = await Promise.all(
    Array.from({ length: pages }, (_, i) => request(endpoint, { page: i + 1 }))
  );
  return responses
    .flatMap((r) => r.results)
    .map((m) => normalize(m, (m.genre_ids || []).map((id) => map[id]).filter(Boolean)));
}

export async function searchShows(query) {
  const map = await getGenreMap();
  const data = await request("/search/movie", { query });
  return data.results.map((m) =>
    normalize(m, (m.genre_ids || []).map((id) => map[id]).filter(Boolean))
  );
}

export async function getShowDetails(id) {
  const m = await request(`/movie/${id}`);
  return normalize(m, (m.genres || []).map((g) => g.name));
}