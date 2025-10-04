import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useEffect } from 'react';

// Component to handle external redirect
function AdminRedirect() {
  useEffect(() => {
    window.location.href = 'http://localhost:6060/admin';
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/admin" element={<AdminRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
