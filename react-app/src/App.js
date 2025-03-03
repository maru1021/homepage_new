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
import { Routes, Route, Navigate, useNavigate, BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/login';
import Modal from "./components/modal/Modal"
import ConfirmDeleteModal from "./components/modal/ConfirmDeleteModal"
import { Box, IconButton, useMediaQuery, useTheme, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [sidebar, setSidebar] = useState('homepage');
  const [mobileOpen, setMobileOpen] = useState(!isMobile);
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(!isMobile);
  }, [isMobile]);

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

  // メニューボタンの表示条件を変更
  const showMenuButton = isMobile;

  // リンククリック時のハンドラーを追加
  const handleLinkClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* メニューボタン - モバイルのみ表示 */}
        {showMenuButton && (
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{
              position: 'fixed',
              left: '20px',  // 位置を固定
              top: '20px',
              zIndex: 2000,
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            {mobileOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}

        <Grid container sx={{ flexGrow: 1, position: 'relative' }}>
          {/* サイドバー */}
          {shouldShowSidebar() && (
            <Grid
              item
              xs={12}
              sm={sidebarWidth}
              sx={{
                display: isMobile ? (mobileOpen ? 'block' : 'none') : 'block',
                maxWidth: { xs: '100%', sm: '320px' },
                width: '100%',
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                zIndex: 1200,
                backgroundColor: {
                  xs: '#fff',
                  sm: theme.palette.background.paper
                },
                boxShadow: { xs: 24, sm: 1 },
                overflowY: 'auto',
                transition: 'all 0.3s'
              }}
            >
              {React.createElement(sidebarComponents[sidebar] || HomepageSidebar, {
                setToken,
                setSidebar: handleSidebarChange,
                mobileOpen,
                onClose: () => setMobileOpen(false),
                isMobile,
                onLinkClick: handleLinkClick,  // 新しいプロップを追加
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
              marginLeft: {
                xs: 0,
                sm: shouldShowSidebar() ? '320px' : 0
              },
              position: 'relative',
              zIndex: 1,
              width: {
                xs: '100%',
                sm: shouldShowSidebar() ? 'calc(100% - 320px)' : '100%'
              },
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#fff'
            }}
          >
            <Box
              component="main"
              sx={{
                width: '100%',
                maxWidth: '1200px',
                minHeight: '100vh',
                boxSizing: 'border-box',
                paddingTop: {
                  xs: token ? '64px' : 0,
                  sm: token ? '40px' : 0
                },
                paddingX: 3,
                margin: '0 auto'
              }}
            >
              <Routes>
                <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={handleSetToken} />} />
                <Route path="/*" element={<AppRoutes isAuthenticated={!!token} />} />
              </Routes>
            </Box>
          </Grid>
        </Grid>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <ConfirmDeleteModal.Root />
        <Modal.Root />
      </Box>
    </Router>
  );
}

export default App;
