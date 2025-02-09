import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Department from '../general/department/Department';
import Employee from '../general/employee/Employee';
import EmployeeAuthority from '../authority/employee_authority/EmployeeAuthority';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/general/department' element={<Department />} />
      <Route path='/general/employee' element={<Employee />} />
      <Route path='/authority/employee_authority' element={<EmployeeAuthority />} />
      <Route path='*' element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
