import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Admin } from './components/Admin';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';

function App() {
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/:groupSlug" element={<Layout />} />
        <Route path="/:groupSlug/:subSlug/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
