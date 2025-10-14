import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Chapter, ChapterImage, Manga } from '../types/database';
import { ArrowUp } from 'lucide-react';

export default function ChapterReader() {
  const { id, chapterNumber } = useParams<{ id: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [images, setImages] = useState<ChapterImage[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (id && chapterNumber) {
      fetchChapterData();
    }
  }, [id, chapterNumber]);

  useEffect(() => {
    const onScroll = () => {
      setShowGoTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // hide chapter header on scroll down, show on scroll up
  useEffect(() => {
    lastY.current = window.scrollY;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (delta > 10 && y > 80) {
          setHeaderHidden(true);
        } else if (delta < -10) {
          setHeaderHidden(false);
        }
        lastY.current = y;
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const fetchChapterData = async () => {
    if (!id || !chapterNumber) return;
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
  const chapters = (chaptersResult.data || []) as Chapter[];
  setAllChapters(chapters);

      const currentChapter = chapters.find(
        c => c.chapter_number === parseFloat(chapterNumber!)
      );

      if (currentChapter) {
        setChapter(currentChapter);

        const { data: imagesData, error: imagesError } = await supabase
          .from('chapter_images')
          .select('*')
          .eq('chapter_id', currentChapter.id)
          .order('page_number', { ascending: true });

        if (imagesError) throw imagesError;
        setImages(imagesData || []);
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = allChapters.findIndex(
    c => c.chapter_number === parseFloat(chapterNumber!)
  );
  const prevChapter = allChapters[currentIndex + 1];
  const nextChapter = allChapters[currentIndex - 1];

  const navigateToChapter = (chapterNum: number) => {
    navigate(`/manga/${id}/chapter/${chapterNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2D5A27] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !manga) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Chapter not found</p>
          <button
            onClick={() => navigate(`/manga/${id}`)}
            className="px-6 py-2 bg-[#2D5A27] text-white rounded-lg hover:bg-[#234a1f] transition-colors"
          >
            Back to Manga Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f0f] dark:text-white">
      <div className={`sticky top-0 z-50 transform transition-transform duration-300 ${headerHidden ? '-translate-y-full' : 'translate-y-0'}`}>
        <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2D5A27]/30">
          <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to={`/manga/${id}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2D5A27] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Details</span>
            </Link>

            <div className="flex-1 mx-4 text-center">
              <h1 className="font-semibold text-sm sm:text-base truncate text-[#2D5A27]">
                {manga.title}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{chapter.title}</p>
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-[#2D5A27] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {showMenu && (
            <div className="mt-4 p-4 bg-white dark:bg-[#0f0f0f] rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-2 text-[#2D5A27]">All Chapters</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {allChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      navigateToChapter(ch.chapter_number);
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      ch.chapter_number === parseFloat(chapterNumber!)
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-400 hover:bg-[#2D5A27]/20 hover:text-white'
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </header>
      </div>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No images available for this chapter.</p>
          </div>
        ) : (
          <div>
            {images.map((image, index) => (
              <div key={image.id} className="overflow-hidden mb-0">
                <img
                  src={image.image_url}
                  alt={`Page ${image.page_number}`}
                  className="w-full h-auto block"
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"%3E%3Crect width="800" height="1200" fill="%231a1a1a"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-between items-center py-6 border-t border-gray-800">
          {prevChapter ? (
            <button
              onClick={() => navigateToChapter(prevChapter.chapter_number)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2D5A27] text-white rounded-lg hover:bg-[#234a1f] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-gray-300">Previous</div>
                <div className="text-sm font-semibold">{prevChapter.title}</div>
              </div>
            </button>
          ) : (
            <div className="flex-1"></div>
          )}

          {nextChapter ? (
            <button
              onClick={() => navigateToChapter(nextChapter.chapter_number)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2D5A27] text-white rounded-lg hover:bg-[#234a1f] transition-colors"
            >
              <div className="text-right">
                <div className="text-xs text-gray-300">Next</div>
                <div className="text-sm font-semibold">{nextChapter.title}</div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </main>

      {/* Go to top button */}
      {showGoTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Go to top"
          className="fixed bottom-6 right-6 p-3 rounded-full bg-[#2D5A27] text-white shadow-lg hover:bg-[#234a1f] transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
