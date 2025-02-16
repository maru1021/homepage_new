import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import reportWebVitals from './reportWebVitals';
import './CSS/index.css';
import Sidebar from './components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

import Login from './pages/login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && token !== savedToken) {
      setToken(savedToken);
    }

    const expirationTime = localStorage.getItem('expiration_time');
    if (expirationTime) {
      const expirationDate = new Date(expirationTime);
      const now = new Date();

      if (now >= expirationDate) {
        handleLogout(); //有効期限が切れていたらログアウト処理
      } else {
        const timeout = expirationDate - now;
        setTimeout(handleLogout, timeout);
      }
    }
  }, [token]); // tokenが変わるたびに実行

  const handleSetToken = (newToken, newExpirationTime) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('expiration_time', newExpirationTime);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiration_time');
    navigate('/login');
  };

  // Sidebarをメモ化して、不要な再レンダリングを防ぐ
  const memoizedSidebar = useMemo(() => <Sidebar setToken={setToken} />, []);

  return (
    <>
      {token ? (
        <>
          {memoizedSidebar}
          <Routes>
            <Route path='/*' element={<AppRoutes />} />
          </Routes>
          <ToastContainer position='top-right' autoClose={3000} hideProgressBar />
        </>
      ) : (
        <Routes>
          <Route path='/login' element={<Login setToken={handleSetToken} />} />
          <Route path='/*' element={<Navigate to='/login' replace />} />
        </Routes>
      )}
    </>
  );
}

const AppWithRouter = () => (
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <App />
  </BrowserRouter>
);

const root = createRoot(document.getElementById('root'));
root.render(<AppWithRouter />);

reportWebVitals();
