import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import ProtectedRouteWrapper from '../components/auth/ProtectedRouteWrapper';

const Line = lazy(() => import('../pages/manufacturing/line/Line'));

const manufacturingRoutes = [
  {
    path: 'master/line',
    element: Line,
    endpoint: '/api/manufacturing/auth_check'
  }
];

const ManufacturingRoutes = ({ isAuthenticated }) => {
  return (
    <ProtectedRouteWrapper
      isAuthenticated={isAuthenticated}
      routes={manufacturingRoutes}
    />
  );
};

ManufacturingRoutes.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired
};

export default ManufacturingRoutes;