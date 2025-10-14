import { BookOpen, Search, Filter, Moon, Sun } from 'lucide-react';
import { useSearchFilters } from '../lib/searchFilter';
import { useTheme } from '../lib/useTheme';
import { useEffect, useRef, useState } from 'react';

function ThemeToggleInline() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] hover:border-[#2D5A27]"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
    </button>
  );
}

export default function Header() {
  const { searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, selectedStatus, setSelectedStatus, allGenres } = useSearchFilters();

  // hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastY.current = window.scrollY;
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        // if scrolling down and past small threshold, hide
        if (delta > 10 && y > 80) {
          setHidden(true);
        } else if (delta < -10) {
          setHidden(false);
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

  return (
    <div className={`sticky top-0 z-50 transform transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2D5A27]/30">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#2D5A27]" />
            <h1 className="text-2xl font-bold text-[#2D5A27]">MangaVerse</h1>
          </div>

          <ThemeToggleInline />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D5A27] text-black placeholder-gray-400 dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="Search manga by title or alternative name..."
            />
          </div>

          <div className="hidden md:flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D5A27] text-black appearance-none cursor-pointer dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-white"
              >
                <option value="">All Genres</option>
                {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D5A27] text-black appearance-none cursor-pointer dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="OnGoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      </header>
    </div>
  );
}
