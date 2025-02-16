import React from 'react';

import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';
import TableMaster from '../../../script/table/TableMaster';

import API_BASE_URL from '../../../config/baseURL';
import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';
import importExcel from '../../../utils/Excel/import_excel';

// 従業員データを取得する関数
const fetchEmployees = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/general/employee`, searchQuery, currentPage, itemsPerPage, 'employees');
};

// Excel出力する関数
const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/general/employee/export_excel?searchQuery=${searchQuery}`);
};

// Excel入力する関数
const ExcelInput = async () => {
    importExcel(`${API_BASE_URL}/api/general/employee/import_excel`);
};

const Employee = () => (
    <TableMaster
        title='従業員一覧'
        fetchData={fetchEmployees}
        TableComponent={EmployeeTable}
        modalTitle='従業員権限登録'
        FormComponent={EmployeeForm}
        ExcelOutput={ExcelOutput}
        ExcelInput={ExcelInput}
    />
);

export default Employee;
