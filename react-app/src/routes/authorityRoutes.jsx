import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import ProtectedRouteWrapper from '../components/auth/ProtectedRouteWrapper';

// EmployeeAuthorityをlazyでラップ
const EmployeeAuthority = lazy(() => import('../pages/authority/employee_authority/EmployeeAuthority'));

const infomationRoutes = [
  {
    path: 'employee_authority',
    element: EmployeeAuthority,
    endpoint: '/api/authority/auth_check'
  }
];

const AuthorityRoutes = ({ isAuthenticated }) => {
  return (
    <ProtectedRouteWrapper
      isAuthenticated={isAuthenticated}
      routes={infomationRoutes}
    />
  );
};

AuthorityRoutes.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired
};

export default AuthorityRoutes;