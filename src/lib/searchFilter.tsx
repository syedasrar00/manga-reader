import React, { createContext, useContext, useState } from 'react';

type SearchFilterContextType = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedGenre: string;
  setSelectedGenre: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  allGenres: string[];
  setAllGenres: (g: string[]) => void;
};

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

export const SearchFilterProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [allGenres, setAllGenres] = useState<string[]>([]);

  return (
    <SearchFilterContext.Provider value={{ searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, selectedStatus, setSelectedStatus, allGenres, setAllGenres }}>
      {children}
    </SearchFilterContext.Provider>
  );
};

export function useSearchFilters() {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) throw new Error('useSearchFilters must be used within SearchFilterProvider');
  return ctx;
}

export default SearchFilterContext;
