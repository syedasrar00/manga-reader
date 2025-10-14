import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Star, TrendingUp, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Manga, Chapter } from '../types/database';

export default function MangaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMangaDetails();
    }
  }, [id]);

  const fetchMangaDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);

      const [mangaResult, chaptersResult] = await Promise.all([
        supabase.from('manga').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('chapters')
          .select('*')
          .eq('manga_id', id)
          .order('chapter_number', { ascending: false })
      ]);

      if (mangaResult.error) throw mangaResult.error;
      if (chaptersResult.error) throw chaptersResult.error;

  setManga(mangaResult.data as Manga | null);
  setChapters((chaptersResult.data || []) as Chapter[]);
    } catch (error) {
      console.error('Error fetching manga details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2D5A27] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading manga details...</p>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Manga not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#2D5A27] text-white rounded-lg hover:bg-[#234a1f] transition-colors"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const genresList = manga.genres ? manga.genres.split(',').map(g => g.trim()) : [];

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white">
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2D5A27]/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2D5A27] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Homepage</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
                {manga.image_url ? (
                  <img
                    src={manga.image_url}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#2D5A27]">
              {manga.title}
            </h1>

            {manga.alternative && (
              <p className="text-gray-400 mb-4">Alternative: {manga.alternative}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {manga.rating && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 text-yellow-500 mb-1">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">Rating</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {manga.rating.match(/[\d.]+/)?.[0] || 'N/A'} / 5
                  </p>
                </div>
              )}

              {manga.rank && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 text-[#2D5A27] mb-1">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Rank</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {manga.rank.match(/\d+/)?.[0] || 'N/A'}
                  </p>
                </div>
              )}

              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Status</span>
                </div>
                <p className="text-sm text-gray-400">{manga.status || 'Unknown'}</p>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 text-purple-500 mb-1">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">Type</span>
                </div>
                <p className="text-sm text-gray-400">{manga.type || 'Manga'}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
              <h2 className="text-xl font-semibold mb-3 text-[#2D5A27]">Information</h2>
              <div className="space-y-2 text-sm">
                {manga.author && (
                  <div className="flex">
                    <span className="text-gray-400 w-24">Author:</span>
                    <span className="text-white">{manga.author}</span>
                  </div>
                )}
                {manga.artist && (
                  <div className="flex">
                    <span className="text-gray-400 w-24">Artist:</span>
                    <span className="text-white">{manga.artist}</span>
                  </div>
                )}
                {manga.release_year && (
                  <div className="flex">
                    <span className="text-gray-400 w-24">Released:</span>
                    <span className="text-white">{manga.release_year}</span>
                  </div>
                )}
              </div>
            </div>

            {genresList.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-[#2D5A27]">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {genresList.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#2D5A27]/20 text-[#2D5A27] rounded-full text-sm border border-[#2D5A27]/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {manga.description && (
              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-semibold mb-3 text-[#2D5A27]">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {manga.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-[#2D5A27]">
            Chapters ({chapters.length})
          </h2>

          {chapters.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No chapters available yet.</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/manga/${id}/chapter/${chapter.chapter_number}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-[#0f0f0f] rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[#2D5A27] transition-all duration-300 hover:shadow-lg hover:shadow-[#2D5A27]/10 group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-[#2D5A27] transition-colors">
                      {chapter.title}
                    </h3>
                    {chapter.published_date && (
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(chapter.published_date)}
                      </p>
                    )}
                  </div>
                  <div className="text-[#2D5A27] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
