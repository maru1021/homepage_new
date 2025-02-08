import React from 'react';

import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';
import TableMaster from '../../script/table/TableMaster';

import API_BASE_URL from '../../baseURL';
import exportExcel from '../../script/Excel/export_excel';
import fetchData from '../../script/table/fetchData';
import importExcel from '../../script/Excel/import_excel';

// 従業員データを取得する関数
const fetchEmployees = async (query = '', page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    return fetchData(`${API_BASE_URL}/api/employees`, token, query, page, limit, 'employees');
};

// Excel出力する関数
const ExcelOutput = async () => {
    const token = localStorage.getItem('token');
    exportExcel(`${API_BASE_URL}/api/departments/export_excel`, token);
};

// Excel入力する関数
const ExcelInput = async (loadData) => {
    const token = localStorage.getItem('token');
    importExcel(`${API_BASE_URL}/api/departments/import_excel`, token, () => loadData());
};

const Employee = () => (
    <TableMaster
        title='従業員一覧'
        fetchData={fetchEmployees}
        TableComponent={EmployeeTable}
        modalTitle='従業員登録'
        FormComponent={EmployeeForm}
        ExcelOutput={ExcelOutput}
        ExcelInput={ExcelInput}
    />
);

export default Employee;
