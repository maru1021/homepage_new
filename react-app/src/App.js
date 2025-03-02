import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import './CSS/index.css';
import HomepageSidebar from './components/sidebar/HomepageSidebar';
import ProductionManagementSidebar from './components/sidebar/ProductionManagementSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/login';
import Modal from "./components/modal/Modal"
import ConfirmDeleteModal from "./components/modal/ConfirmDeleteModal"
import { Box, IconButton, useMediaQuery, useTheme, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { logger } from './utils/logger';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [sidebar, setSidebar] = useState('homepage');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // トークンの管理（有効期限チェック & 自動ログアウト）
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

  useEffect(() => {
    logger.log('isMobile:', isMobile);  // 開発環境でのみ表示
  }, [isMobile]);

  // 新しいトークンをセットする関数
  const handleSetToken = (newToken, newExpirationTime) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('expiration_time', newExpirationTime);
  };

  // ログアウト処理
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiration_time');
    navigate('/login');
  };

  // サイドバーを表示するかどうかの判定
  const shouldShowSidebar = () => {
    if (window.location.pathname === '/login') return false;
    if (sidebar === 'productionManagement' && !token) return false;
    return true;
  };

  // サイドバーのマッピング
  const sidebarComponents = {
    homepage: HomepageSidebar,
    productionManagement: ProductionManagementSidebar,
  };

  // サイドバーの幅を動的に決定
  const sidebarWidth = sidebar === 'homepage' ? 2.5 : 2;
  const mainContentWidth = 12 - sidebarWidth;

  // サイドバー切り替え時の処理
  const handleSidebarChange = (newSidebar) => {
    if (newSidebar === 'productionManagement' && !token) {
      navigate('/login');
      return;
    }
    setSidebar(newSidebar);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* モバイルメニューボタン */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            left: '10px',
            top: '10px',
            zIndex: 2000,
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Grid container sx={{ flexGrow: 1 }}>
        {/* サイドバー */}
        {shouldShowSidebar() && (
          <Grid
            item
            xs={12}
            sm={sidebarWidth}
            sx={{
              display: { xs: mobileOpen ? 'block' : 'none', sm: 'block' },  // モバイル時の表示制御
              maxWidth: '500px',
              position: { xs: 'fixed', sm: 'relative' },  // モバイル時は固定位置
              height: '100vh',
              zIndex: 1900,
              backgroundColor: 'background.paper',
              boxShadow: { xs: 24, sm: 1 }
            }}
          >
            {React.createElement(sidebarComponents[sidebar] || HomepageSidebar, {
              setToken,
              setSidebar: handleSidebarChange,
              mobileOpen,
              onClose: handleDrawerToggle,
              isMobile,
              key: sidebar
            })}
          </Grid>
        )}

        {/* メインコンテンツ */}
        <Grid
          item
          xs={12}
          sm={shouldShowSidebar() ? mainContentWidth : 12}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            marginLeft: { xs: 0, sm: shouldShowSidebar() ? `${sidebarWidth}%` : 0 }  // サイドバーの幅を考慮
          }}
        >
          <Box
            component="main"
            sx={{
              width: '100%',
              minHeight: '100vh',
              boxSizing: 'border-box',
              paddingTop: {
                xs: token ? '64px' : 0,
                sm: token ? '20px' : 0
              },
              paddingX: 3,
              transition: 'margin-left 0.3s',
              ...(isMobile && mobileOpen && token && {
                opacity: 0.7
              })
            }}
          >
            <Routes>
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={handleSetToken} />} />
              <Route path="/*" element={<AppRoutes isAuthenticated={!!token} />} />
            </Routes>
          </Box>
        </Grid>
      </Grid>

      {/* モバイル時のオーバーレイ */}
      {isMobile && mobileOpen && token && (
        <Box
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1800
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <ConfirmDeleteModal.Root />
      <Modal.Root />
    </Box>
  );
}

export default App;
