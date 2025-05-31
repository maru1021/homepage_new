import React from 'react';
import PropTypes from 'prop-types';
import ProtectedRouteWrapper from '../components/auth/ProtectedRouteWrapper';

import Department from '../pages/general/department/Department';
import Employee from '../pages/general/employee/Employee';

const generalRoutes = [
  {
    path: 'department',
    element: Department,
    endpoint: '/api/general/auth_check'
  },
  {
    path: 'employee',
    element: Employee,
    endpoint: '/api/general/auth_check'
  }
];

const GeneralRoutes = ({ isAuthenticated }) => {
  return (
    <ProtectedRouteWrapper
      isAuthenticated={isAuthenticated}
      routes={generalRoutes}
    />
  );
};

GeneralRoutes.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired
};

export default GeneralRoutes;