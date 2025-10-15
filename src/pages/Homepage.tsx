import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Manga, Chapter } from "../types/database";
import { useSearchFilters } from "../lib/searchFilter";

export default function Homepage() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  // search/filters are provided by SearchFilterProvider via Header
  const { searchQuery, selectedGenre, selectedStatus } = useSearchFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("manga")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setManga(data || []);
    } catch (error) {
      console.error("Error fetching manga:", error);
    } finally {
      setLoading(false);
    }
  };

  const allGenres = useMemo(() => {
    const genresSet = new Set<string>();
    manga.forEach((m) => {
      if (m.genres) {
        m.genres.split(",").forEach((g) => genresSet.add(g.trim()));
      }
    });
    return Array.from(genresSet).sort();
  }, [manga]);

  // provide genres to global filters
  const { setAllGenres } = useSearchFilters();
  useEffect(() => {
    setAllGenres(allGenres);
  }, [allGenres, setAllGenres]);

  const filteredManga = useMemo(() => {
    return manga.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.alternative &&
          m.alternative.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        !selectedGenre ||
        (m.genres &&
          m.genres.toLowerCase().includes(selectedGenre.toLowerCase()));

      const matchesStatus =
        !selectedStatus ||
        (m.status && m.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [manga, searchQuery, selectedGenre, selectedStatus]);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredManga.length / itemsPerPage)
  );

  // Ensure currentPage is within bounds when filtered results change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedManga = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredManga.slice(start, start + itemsPerPage);
  }, [filteredManga, currentPage]);

  // Map of mangaId -> Chapter[] (ordered by chapter_number desc)
  const [chaptersByManga, setChaptersByManga] = useState<
    Record<string, Chapter[]>
  >({});

  // helper to format created date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  // Fetch last chapters for visible (paginated) manga
  useEffect(() => {
    const ids = paginatedManga.map((m) => m.id).filter(Boolean);
    if (ids.length === 0) {
      setChaptersByManga({});
      return;
    }

    let isCancelled = false;
    const fetchChapters = async () => {
      try {
        const { data, error } = await supabase
          .from("chapters")
          .select("*")
          .in("manga_id", ids);

        if (error) throw error;
        if (isCancelled) return;

        const map: Record<string, Chapter[]> = {};

        const sortedChapters = (data || []).sort((a: Chapter, b: Chapter) => {
          const numA = parseInt(a.title.match(/\d+/)?.[0] || "0", 10);
          const numB = parseInt(b.title.match(/\d+/)?.[0] || "0", 10);
          return numB - numA;
        });

        const chapters = (sortedChapters || []) as Chapter[];
        chapters.forEach((ch) => {
          const key = ch.manga_id;
          if (!map[key]) map[key] = [];
          map[key].push(ch);
        });

        if (!isCancelled) setChaptersByManga(map);
      } catch (err) {
        console.error("Error fetching chapters for homepage:", err);
      }
    };

    fetchChapters();
    return () => {
      isCancelled = true;
    };
  }, [paginatedManga]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2D5A27] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {paginatedManga.length} of {filteredManga.length} results (
            {manga.length} total)
          </p>
          <div className="text-gray-400 text-sm">
            Page {currentPage} / {totalPages}
          </div>
        </div>

        {filteredManga.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No manga found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {paginatedManga.map((m) => (
                <Link
                  key={m.id}
                  to={`/manga/${m.id}`}
                  className="group bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#2D5A27] transition-all duration-300 hover:shadow-lg hover:shadow-[#2D5A27]/20 hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {m.image_url ? (
                      <img
                        src={m.image_url}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-700" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#2D5A27] transition-colors text-black dark:text-white">
                      {m.title}
                    </h3>

                    {m.rating && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>⭐</span>
                        <span>{m.rating.match(/[\d.]+/)?.[0] || "N/A"}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-1 bg-[#2D5A27]/20 text-[#2D5A27] rounded">
                        {m.type || "Manga"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          m.status === "OnGoing"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {m.status || "Unknown"}
                      </span>
                    </div>

                    {/* Last 2 chapters */}
                    <div className="mt-auto pt-2 border-t border-transparent dark:border-transparent">
                      {(chaptersByManga[m.id] || []).slice(0, 2).map((ch) => (
                        <Link
                          key={ch.id}
                          to={`/manga/${m.id}/chapter/${ch.chapter_number}`}
                          className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2D5A27]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{ch.title}</span>
                            <span className="ml-2 text-xs text-gray-400">
                              {formatDate(ch.published_date)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "border-gray-700 hover:border-[#2D5A27]"
                }`}
              >
                Prev
              </button>

              {/* Show a small range of page numbers around the current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md border ${
                      page === currentPage
                        ? "bg-[#2D5A27] text-black border-[#2D5A27]"
                        : "border-gray-700 hover:border-[#2D5A27]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "border-gray-700 hover:border-[#2D5A27]"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
