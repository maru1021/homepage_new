import React from 'react';

import EmployeeAuthorityTable from './EmployeeAuthorityTable';
import EmployeeAuthorityForm from './EmployeeAuthorityForm';
import TableMaster from '../../script/table/TableMaster';

import API_BASE_URL from '../../baseURL';
import exportExcel from '../../script/Excel/export_excel';
import fetchData from '../../script/table/fetchData';
import importExcel from '../../script/Excel/import_excel';

// 従業員データを取得する関数
const fetchEmployees = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    const token = localStorage.getItem('token');
    return fetchData(`${API_BASE_URL}/api/authority/employee_authority`, token, searchQuery, currentPage, itemsPerPage, 'employees');
};

// Excel出力する関数
const ExcelOutput = async (searchQuery) => {
    const token = localStorage.getItem('token');
    exportExcel(`${API_BASE_URL}/api/authority/employee_authority/export_excel?searchQuery=${searchQuery}`, token);
};

// Excel入力する関数
const ExcelInput = async (loadData) => {
    const token = localStorage.getItem('token');
    importExcel(`${API_BASE_URL}/api/authority/employee_authority/import_excel`, token, () => loadData());
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
