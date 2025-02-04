import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import reportWebVitals from './reportWebVitals';
import './CSS/index.css';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Login from './login';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null); // 初期状態でトークンを取得

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && token !== savedToken) {
      setToken(savedToken);
    }
  }, [token]); // tokenが変わるたびに実行

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // Sidebarをメモ化して、不要な再レンダリングを防ぐ
  const memoizedSidebar = useMemo(() => <Sidebar setToken={setToken} />, []);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
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
    </BrowserRouter>
  );
}


const root = createRoot(document.getElementById('root'));
root.render(<App />);

reportWebVitals();
