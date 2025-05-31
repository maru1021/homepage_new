import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProtectedRoute from '../components/auth/ProtectedRoute';

import Index from '../pages/homepage/index';
import Type from '../pages/homepage/type/Type';
import Classification from '../pages/homepage/classification/Classification';
import NotFound from '../pages/error/404';
import Forbidden from '../pages/error/403';
import Article from '../pages/homepage/article/article';
import ArticleNew from '../pages/homepage/article/new';
import Sky from '../pages/homepage/3D/Sky/Sky';
import HtmlTraining from '../pages/homepage/html_training/HtmlTraining';
import StockChart from '../pages/homepage/stock_chart/SrockChart';
import LocationDisplay from '../pages/homepage/LocationDisplay/LocationDisplay';
import BulletinBoardRegister from '../pages/all/bulletin_board/BulletinBoardRegister';
import BulletinBoardDetail from '../pages/all/bulletin_board/BulletinBoardDetail';
import BulletinBoardList from '../pages/all/bulletin_board/BulletinBoardList';

import GeneralRoutes from './generalRoutes';
import AuthorityRoutes from './authorityRoutes';
import ManufacturingRoutes from './manufacturingRoutes';

const AppRoutes = ({ isAuthenticated = false }) => {
  return (
    <Routes>
      {/* パブリックルート（ログイン不要） */}
      <Route path='/' element={<Index />} />
      <Route path='/homepage/article/:id' element={<Article />} />
      <Route path='/homepage/type' element={<Type />} />
      <Route path='/homepage/classification' element={<Classification />} />
      <Route path='/homepage/article/new' element={<ArticleNew />} />
      <Route path='/homepage/html_training' element={<HtmlTraining />} />
      <Route path='/homepage/3D/sky' element={<Sky />} />
      <Route path='/homepage/stock_chart' element={<StockChart />} />
      <Route path='/homepage/current_location' element={<LocationDisplay />} />

      {/* 総務部ルート */}
      <Route path='/general/*' element={<GeneralRoutes isAuthenticated={isAuthenticated} />} />

      {/* 情報システム室ルート */}
      <Route path='/authority/*' element={<AuthorityRoutes isAuthenticated={isAuthenticated} />} />

      {/* 製造部ルート */}
      <Route path='/manufacturing/*' element={<ManufacturingRoutes isAuthenticated={isAuthenticated} />} />

      {/* 掲示板 */}
      <Route
        path='/all/bulletin_board/register'
        element={
          isAuthenticated ? (
            <ProtectedRoute endpoint="/api/all/auth_check">
              <Suspense fallback={null}>
                <BulletinBoardRegister />
              </Suspense>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path='/all/bulletin_board/list'
        element={
          isAuthenticated ? (
            <ProtectedRoute endpoint="/api/all/auth_check">
              <Suspense fallback={null}>
                <BulletinBoardList />
              </Suspense>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path='/all/bulletin_board/:id'
        element={
          isAuthenticated ? (
            <ProtectedRoute endpoint="/api/all/auth_check">
              <Suspense fallback={null}>
                <BulletinBoardDetail />
              </Suspense>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404ページ */}
      <Route path='*' element={<NotFound />} />

      {/* 403ページ */}
      <Route path='/403' element={<Forbidden />} />
    </Routes>
  );
};

AppRoutes.propTypes = {
  isAuthenticated: PropTypes.bool
};

export default AppRoutes;