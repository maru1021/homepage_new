import React from "react";
import { Routes, Route } from "react-router-dom";
import Employee from "../general/employee/Employee";
import Department from "../general/department/Department";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/general/employee" element={<Employee />} />
      <Route path="/general/department" element={<Department />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
