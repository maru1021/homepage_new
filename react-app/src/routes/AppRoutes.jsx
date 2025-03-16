import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import Index from '../pages/homepage/index';
import Type from '../pages/homepage/type/Type';
import Classification from '../pages/homepage/classification/Classification';
import Department from '../pages/general/department/Department';
import Employee from '../pages/general/employee/Employee';
import EmployeeAuthority from '../pages/authority/employee_authority/EmployeeAuthority';
import NotFound from '../pages/error/404';
import Article from '../pages/homepage/article/article';
import ArticleNew from '../pages/homepage/article/new';
import Sky from '../pages/homepage/3D/Sky/Sky';
import HtmlTraining from '../pages/homepage/html_training/HtmlTraining';
import StockChart from '../pages/homepage/stock_chart/SrockChart';
import LocationDisplay from '../pages/homepage/LocationDisplay/LocationDisplay';
import BulletinBoardRegister from '../pages/all/BulletinBoardRegister';
import BulletinBoardDetail from '../pages/all/BulletinBoardDetail';
// import BulletinBoardList from '../pages/all/BulletinBoardList';

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

      {/* プライベートルート（ログイン必要） */}
      <Route
        path='/general/department'
        element={isAuthenticated ? <Department /> : <Navigate to="/login" replace />}
      />
      <Route
        path='/general/employee'
        element={isAuthenticated ? <Employee /> : <Navigate to="/login" replace />}
      />
      <Route
        path='/authority/employee_authority'
        element={isAuthenticated ? <EmployeeAuthority /> : <Navigate to="/login" replace />}
      />

      {/* 掲示板関連のルート */}
      <Route
        path='/all/bulletin_board'
        element={isAuthenticated ? <BulletinBoardRegister /> : <Navigate to="/login" replace />}
      />
      <Route
        path='/all/bulletin_board/list'
        // element={isAuthenticated ? <BulletinBoardList /> : <Navigate to="/login" replace />}
      />
      <Route
        path='/all/bulletin_board/:id'
        element={isAuthenticated ? <BulletinBoardDetail /> : <Navigate to="/login" replace />}
      />

      {/* 404ページ */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

AppRoutes.propTypes = {
  isAuthenticated: PropTypes.bool
};

export default AppRoutes;