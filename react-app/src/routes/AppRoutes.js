import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Type from '../pages/homepage/type/Type';
import Department from '../pages/general/department/Department';
import Employee from '../pages/general/employee/Employee';
import EmployeeAuthority from '../pages/authority/employee_authority/EmployeeAuthority';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/homepage/type' element={<Type />} />
      <Route path='/homepage/classification' element={<Department />} />
      <Route path='/general/department' element={<Department />} />
      <Route path='/general/employee' element={<Employee />} />
      <Route path='/authority/employee_authority' element={<EmployeeAuthority />} />
      <Route path='*' element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
