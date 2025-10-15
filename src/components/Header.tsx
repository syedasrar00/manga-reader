import { BookOpen, Search, Filter, Moon, Sun, X } from 'lucide-react';
import { useSearchFilters } from '../lib/searchFilter';
import { useTheme } from '../lib/useTheme';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  // hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Focus and close mobile search when necessary
  useEffect(() => {
    if (!isMobileSearchOpen) return;
    mobileInputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSearchOpen(false);
    };

    const onClickOutside = (e: MouseEvent) => {
      if (!mobileSearchRef.current) return;
      if (!mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClickOutside);
    };
  }, [isMobileSearchOpen]);

  // scroll hide/show
  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastY.current = window.scrollY;
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
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
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between gap-4">
            {/* Logo area */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* mobile: show icon to open search */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 p-1 rounded-sm text-[#2D5A27] sm:hidden"
                aria-label="Go to homepage"
              >
                <BookOpen className="w-8 h-8" />
                <span className="text-lg font-semibold">MangaVerse</span>
              </button>

              {/* desktop: show full logo */}
              <div className="hidden sm:flex items-center gap-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <BookOpen className="w-8 h-8 text-[#2D5A27]" />
                <h1 className="text-2xl font-bold text-[#2D5A27]">MangaVerse</h1>
              </div>
            </div>

            {/* Desktop search */}
            <div className="relative flex-1 mx-4 hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D5A27] text-black placeholder-gray-400 dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="Search manga by title or alternative name..."
              />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-3">
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

              <div className="hidden sm:inline-flex">
                <ThemeToggleInline />
              </div>
                {/* mobile search trigger on the right side */}
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-1 sm:hidden"
                  aria-label="Open search"
                >
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
            </div>
          </div>

          {/* Mobile search overlay/input when opened */}
          {isMobileSearchOpen && (
            <div ref={mobileSearchRef} className="absolute left-4 right-4 top-4 z-50 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={mobileInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2D5A27] text-black placeholder-gray-400 dark:bg-[#0f0f0f] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                  placeholder="Search manga by title or alternative name..."
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  aria-label="Close search"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
