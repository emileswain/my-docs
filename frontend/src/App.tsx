import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Layout } from './components/Layout';
import { Admin } from './components/Admin';
import { DeepLinkHandler } from './components/DeepLinkHandler';
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

  // Open http(s) links (e.g. inside rendered documents) in the system browser
  // instead of navigating the webview away from the app.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      const href = anchor?.getAttribute('href');
      if (href && /^https?:\/\//i.test(href)) {
        e.preventDefault();
        openUrl(href).catch((err) => console.error('Failed to open link:', err));
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <BrowserRouter>
      <DeepLinkHandler />
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
