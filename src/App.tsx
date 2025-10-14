import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import MangaDetails from './pages/MangaDetails';
import ChapterReader from './pages/ChapterReader';
import { useTheme } from './lib/useTheme';
import Header from './components/Header';
import { SearchFilterProvider } from './lib/searchFilter';

function App() {
  // initialize theme on app load
  useTheme();
  return (
    <Router>
      <SearchFilterProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
          <Route path="/manga/:id/chapter/:chapterNumber" element={<ChapterReader />} />
        </Routes>
      </SearchFilterProvider>
    </Router>
  );
}

export default App;
