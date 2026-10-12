import { useEffect, useState } from "react";
import { getShows, searchShows } from "../api/tmdb";

export default function useShows(query, browse) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
  const data = query.trim() ? await searchShows(query.trim()) : await getShows(browse);
        if (!ignore) setShows(data);
      } catch (err) {
        if (!ignore) setError(err.message || "Something went wrong.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 350);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { shows, loading, error };
}
