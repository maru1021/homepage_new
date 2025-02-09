import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Department from '../general/department/Department';
import EmployeeeAuthority from '../authority/employee_authority/EmployeeeAuthority';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/authority/employee_authority' element={<EmployeeeAuthority />} />
      <Route path='/general/department' element={<Department />} />
      <Route path='*' element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
