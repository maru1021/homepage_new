import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import ProtectedRouteWrapper from '../components/auth/ProtectedRouteWrapper';

const Line = lazy(() => import('../pages/manufacturing/line/Line'));
const Machine = lazy(() => import('../pages/manufacturing/machine/Machine'));
const LineMap = lazy(() => import('../pages/manufacturing/line_map/LineMap'));

const manufacturingRoutes = [
  {
    path: 'master/line',
    element: Line,
    endpoint: '/api/manufacturing/auth_check'
  },
  {
    path: 'master/machine',
    element: Machine,
    endpoint: '/api/manufacturing/auth_check'
  },
  {
    path: 'line_map',
    element: LineMap,
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