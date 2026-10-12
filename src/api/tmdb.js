const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const IMG = "https://image.tmdb.org/t/p";

async function request(path, params = {}) {
  const qs = new URLSearchParams({ api_key: API_KEY, ...params });
  const res = await fetch(`${BASE_URL}${path}?${qs}`);
  if (!res.ok) throw new Error(`Request failed (${res.status}). Please try again.`);
  return res.json();
}

const genreMaps = {};
async function getGenreMap(type) {
  if (!genreMaps[type]) {
    const data = await request(`/genre/${type}/list`);
    genreMaps[type] = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
  }
  return genreMaps[type];
}

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function normalize(m, type, genreNames = []) {
  return {
    id: m.id,
    type,
    name: m.title || m.name,
    language: m.original_language,
    genres: genreNames,
    premiered: m.release_date || m.first_air_date || "",
    status: m.status || "",
    officialSite: m.homepage || null,
    rating: { average: m.vote_count > 0 ? m.vote_average : null },
    image: m.poster_path
      ? { medium: `${IMG}/w342${m.poster_path}`, original: `${IMG}/w780${m.poster_path}` }
      : null,
    summary: m.overview ? `<p>${escapeHtml(m.overview)}</p>` : "",
  };
}

const CATEGORY = {
  movie: { popular: "popular", newest: "upcoming", top: "top_rated" },
  tv: { popular: "popular", newest: "on_the_air", top: "top_rated" },
};

const withGenres = (m, type, map) =>
  normalize(m, type, (m.genre_ids || []).map((id) => map[id]).filter(Boolean));
async function fetchPages(endpoint, params, start, count) {
  const first = await request(endpoint, { ...params, page: start });
  const totalPages = Math.min(first.total_pages || 1, 500); 

  const lastPage = Math.min(start + count - 1, totalPages);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, lastPage - start) }, (_, i) =>
      request(endpoint, { ...params, page: start + 1 + i })
    )
  );

  return { results: [first, ...rest].flatMap((r) => r.results), totalPages };
}

export async function getShows(type = "movie", browse = "popular", start = 1, count = 3) {
  const map = await getGenreMap(type);
  const endpoint = `/${type}/${CATEGORY[type][browse] || "popular"}`;
  const { results, totalPages } = await fetchPages(endpoint, {}, start, count);
  return { shows: results.map((m) => withGenres(m, type, map)), totalPages };
}

export async function searchShows(type = "movie", query, start = 1, count = 3) {
  const map = await getGenreMap(type);
  const { results, totalPages } = await fetchPages(`/search/${type}`, { query }, start, count);
  return { shows: results.map((m) => withGenres(m, type, map)), totalPages };
}

export async function getShowDetails(type = "movie", id) {
  const m = await request(`/${type}/${id}`, { append_to_response: "credits,videos" });
  const base = normalize(m, type, (m.genres || []).map((g) => g.name));

  const trailer =
    m.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    m.videos?.results?.find((v) => v.site === "YouTube");

  return {
    ...base,
    language: m.spoken_languages?.[0]?.english_name || base.language,
    tagline: m.tagline || "",
    runtime: m.runtime || m.episode_run_time?.[0] || null,
    voteCount: m.vote_count || 0,
    budget: m.budget || 0,
    revenue: m.revenue || 0,
    director: m.credits?.crew?.find((c) => c.job === "Director")?.name || "",
    creator: (m.created_by || []).map((c) => c.name).join(", "),
    seasons: m.number_of_seasons || null,
    episodes: m.number_of_episodes || null,
    cast: (m.credits?.cast || []).slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photo: c.profile_path ? `${IMG}/w185${c.profile_path}` : null,
    })),
    trailerKey: trailer?.key || null,
    companies: (m.production_companies || m.networks || []).slice(0, 6).map((c) => c.name),
  };
}

export async function getPersonDetails(id) {
  const p = await request(`/person/${id}`, { append_to_response: "combined_credits" });

   const seen = new Set();
  const credits = (p.combined_credits?.cast || [])
    .filter((c) => (c.media_type === "movie" || c.media_type === "tv") && c.poster_path)
    .filter((c) => !(c.genre_ids || []).some((g) => g === 10767 || g === 10763))
    .filter((c) => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 80)
    .map((c) => ({
      id: c.id,
      type: c.media_type,
      name: c.title || c.name,
      character: c.character,
      premiered: c.release_date || c.first_air_date || "",
      rating: { average: c.vote_count > 0 ? c.vote_average : null },
      genres: [],
      summary: c.overview ? `<p>${escapeHtml(c.overview)}</p>` : "",
      image: { medium: `${IMG}/w342${c.poster_path}`, original: `${IMG}/w780${c.poster_path}` },
    }))
    .sort((a, b) => {
      if (!a.premiered && !b.premiered) return 0;
      if (!a.premiered) return 1;
      if (!b.premiered) return -1;
      return b.premiered.localeCompare(a.premiered);
    });

  return {
    id: p.id,
    name: p.name,
    biography: p.biography || "",
    birthday: p.birthday || "",
    deathday: p.deathday || "",
    birthplace: p.place_of_birth || "",
    department: p.known_for_department || "",
    photo: p.profile_path ? `${IMG}/h632${p.profile_path}` : null,
    credits,
  };
}