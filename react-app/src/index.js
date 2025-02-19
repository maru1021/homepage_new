import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import reportWebVitals from './reportWebVitals';
import './CSS/index.css';
import HomepageSidebar from './components/sidebar/HomepageSidebar';
import ProductionManagementSidebar from './components/sidebar/ProductionManagementSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [sidebar, setSidebar] = useState('homepage'); // デフォルトのサイドバー
  const navigate = useNavigate();

  // **トークンの管理（有効期限チェック & 自動ログアウト）**
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedToken !== token) {
      setToken(savedToken);
    }

    const expirationTime = localStorage.getItem('expiration_time');
    if (expirationTime) {
      const expirationDate = new Date(expirationTime);
      const now = new Date();

      if (now >= expirationDate) {
        handleLogout();
      } else {
        const timeout = expirationDate - now;
        setTimeout(handleLogout, timeout);
      }
    }
  }, []);

  // **新しいトークンをセットする関数**
  const handleSetToken = (newToken, newExpirationTime) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('expiration_time', newExpirationTime);
  };

  // **ログアウト処理**
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiration_time');
    navigate('/login');
  };

  // **サイドバーのマッピング**
  const sidebarComponents = {
    homepage: HomepageSidebar,
    productionManagement: ProductionManagementSidebar,
  };

  // **選択されたサイドバーを動的にレンダリング**
  const SelectedSidebar = sidebarComponents[sidebar] || HomepageSidebar;

  return (
    <>
      {!token && sidebar !== 'homepage' ? null : React.createElement(SelectedSidebar, { setToken, setSidebar, key: sidebar })}

      <Routes>
        <Route path="/*" element={sidebar === 'homepage' ? <AppRoutes /> : token ? <AppRoutes /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={handleSetToken} />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
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
