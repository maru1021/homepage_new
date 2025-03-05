import React from 'react';

import EmployeeAuthorityTable from './EmployeeAuthorityTable';
import EmployeeAuthorityForm from './EmployeeAuthorityForm';
import TableMaster from '../../../components/table/TableMaster';

import { API_BASE_URL } from '../../../config/baseURL';
import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';
import importExcel from '../../../utils/Excel/import_excel';


const fetchEmployees = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/authority/employee_authority`, searchQuery, currentPage, itemsPerPage, 'employees');
};

const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/authority/employee_authority/export_excel?searchQuery=${searchQuery}`);
};

const ExcelInput = async () => {
    importExcel(`${API_BASE_URL}/api/authority/employee_authority/import_excel`);
};

const EmployeeAuthority = () => (
    <TableMaster
        title='従業員権限一覧'
        fetchData={fetchEmployees}
        TableComponent={EmployeeAuthorityTable}
        modalTitle='従業員権限登録'
        FormComponent={EmployeeAuthorityForm}
        ExcelOutput={ExcelOutput}
        ExcelInput={ExcelInput}
    />
);

export default EmployeeAuthority;
