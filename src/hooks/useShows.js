import { useCallback, useEffect, useRef, useState } from "react";
import { getShows, searchShows } from "../api/tmdb";

const PAGES_PER_BATCH = 3; 

export default function useShows(query, browse, type) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const requestId = useRef(0);

  const fetchBatch = useCallback(
    (start) =>
      query.trim()
        ? searchShows(type, query.trim(), start, PAGES_PER_BATCH)
        : getShows(type, browse, start, PAGES_PER_BATCH),
    [query, browse, type]
  );

  useEffect(() => {
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchBatch(1);
        if (id !== requestId.current) return;
        setShows(data.shows);
        setTotalPages(data.totalPages);
        setNextPage(1 + PAGES_PER_BATCH);
      } catch (err) {
        if (id === requestId.current) setError(err.message || "Something went wrong.");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (loadingMore || nextPage > totalPages) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const data = await fetchBatch(nextPage);
      if (id !== requestId.current) return;
      setShows((prev) => {
        const seen = new Set(prev.map((s) => s.id));
        return [...prev, ...data.shows.filter((s) => !seen.has(s.id))];
      });
      setNextPage((p) => p + PAGES_PER_BATCH);
    } catch {

    } finally {
      setLoadingMore(false);
    }
  }, [fetchBatch, loadingMore, nextPage, totalPages]);

  return { shows, loading, loadingMore, error, hasMore: nextPage <= totalPages, loadMore };
}