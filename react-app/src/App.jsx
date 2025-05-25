import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import './CSS/index.css';
import HomepageSidebar from './components/sidebar/HomepageSidebar';
import ProductionManagementSidebar from './components/sidebar/ProductionManagementSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/table.css';
import './CSS/modal.css';
import './CSS/contextmenu.css';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login';
import Modal from "./components/modal/Modal"
import ConfirmDeleteModal from "./components/modal/ConfirmDeleteModal"
import { Box, IconButton, useMediaQuery, useTheme, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AuthService from './services/auth'; // 認証サービスのインポート

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [sidebar, setSidebar] = useState(localStorage.getItem('currentSidebar') || 'homepage');
  const [mobileOpen, setMobileOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(!isMobile);
  }, [isMobile]);

  // 認証状態の監視
  useEffect(() => {
    // 定期的に認証状態をチェック
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      // 認証切れの場合は自動リフレッシュを試みる
      if (!authenticated && AuthService.getCurrentUser()) {
        refreshToken();
      }
    };

    checkAuth(); // 初回チェック

    // 5分ごとにチェック
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // URLの変更を監視して認証を確認
  useEffect(() => {
    const isProtectedRoute = !location.pathname.startsWith('/login');

    if (isProtectedRoute && !isAuthenticated) {
      // 保護されたルートに未認証でアクセスした場合
      const currentUser = AuthService.getCurrentUser();

      if (currentUser) {
        // ユーザー情報があれば自動リフレッシュを試みる
        refreshToken();
      }
    }
  }, [location.pathname, isAuthenticated]);

  // トークンのリフレッシュを試みる
  const refreshToken = async () => {
    try {
      await AuthService.refreshToken();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('トークンリフレッシュエラー:', error);
      handleLogout();
    }
  };

  // 新しいトークンをセットする関数 (Login.jsxから呼び出される)
  const handleSetAuth = (authenticated) => {
    setIsAuthenticated(authenticated);
  };

  // ログアウト処理
  const handleLogout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setSidebar('homepage');  // サイドバーをホームページに戻す
    localStorage.removeItem('currentSidebar');  // サイドバーの状態も削除
    navigate('/login');
  };

  // サイドバーを表示するかどうかの判定
  const shouldShowSidebar = () => {
    if (location.pathname === '/login') return false;
    if (sidebar === 'productionManagement' && !isAuthenticated) return false;
    return true;
  };

  // サイドバーのマッピング
  const sidebarComponents = {
    homepage: HomepageSidebar,
    productionManagement: ProductionManagementSidebar,
  };

  const handleSidebarChange = (newSidebar) => {
    if (newSidebar === 'productionManagement' && !isAuthenticated) {
      navigate('/login');
      return;
    }
    setSidebar(newSidebar);
    localStorage.setItem('currentSidebar', newSidebar);
  };

  // メモ化したサイドバーコンポーネントの生成
  const MemoizedSidebar = useMemo(() => {
    const SidebarComponent = sidebarComponents[sidebar] || HomepageSidebar;
    return React.createElement(SidebarComponent, {
      logout: handleLogout,
      setSidebar: handleSidebarChange,
      mobileOpen,
      onClose: () => setMobileOpen(false),
      isMobile,
      isAuthenticated,
      setToken: handleSetAuth,
      key: sidebar
    });
  }, [sidebar, isAuthenticated, mobileOpen, isMobile]);

  // サイドバーの幅を動的に決定
  const sidebarWidth = sidebar === 'homepage' ? 320 : 250;
  const mainContentWidth = 10;

  // メニューボタンの表示条件を変更
  const showMenuButton = isMobile;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* メニューボタン - モバイルのみ表示 */}
      {showMenuButton && (
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: 'fixed',
            left: mobileOpen ? '160px' : '20px',
            top: '20px',
            zIndex: 2000,
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          {mobileOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <Grid container sx={{
        flexGrow: 1,
        position: 'relative',
        margin: 0,
        width: '100%',
        padding: 0
      }}>
        {/* サイドバー */}
        {shouldShowSidebar() && (
          <Grid
            item
            xs={12}
            sm={2}
            sx={{
              display: isMobile ? (mobileOpen ? 'block' : 'none') : 'block',
              width: sidebar === '320px',
              position: 'fixed',
              zIndex: 999,
            }}
          >
            {MemoizedSidebar}
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
              sm: shouldShowSidebar() ? `${sidebarWidth}px` : 0
            },
            position: 'relative',
            zIndex: 1,
            width: {
              xs: '100%',
              sm: shouldShowSidebar() ? `calc(100% - ${sidebarWidth}px)` : '100%'
            },
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: 0,
            borderLeft: 'none'
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
                xs: isAuthenticated ? '64px' : 0,
                sm: isAuthenticated ? '40px' : 0
              },
              paddingX: 3,
              margin: '0 auto'
            }}
          >
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login setAuth={handleSetAuth} />} />
              <Route path="/*" element={<AppRoutes isAuthenticated={isAuthenticated} />} />
            </Routes>
          </Box>
        </Grid>
      </Grid>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <ConfirmDeleteModal.Root />
      <Modal.Root />
    </Box>
  );
}

export default App;