import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProtectedRoute from './ProtectedRoute';

const ProtectedRouteWrapper = ({ isAuthenticated, routes }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {routes.map(({ path, element: Element, endpoint }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute endpoint={endpoint}>
              <Suspense fallback={null}>
                <Element />
              </Suspense>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};

ProtectedRouteWrapper.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      element: PropTypes.elementType.isRequired,
      endpoint: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ProtectedRouteWrapper;