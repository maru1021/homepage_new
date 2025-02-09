import React from 'react';

import API_BASE_URL from '../../baseURL';
import DepartmentForm from './DepartmentForm';
import DepartmentTable from './DepartmentTable';
import TableMaster from '../../script/table/TableMaster';

import exportExcel from '../../script/Excel/export_excel';
import fetchData from '../../script/table/fetchData';
import importExcel from '../../script/Excel/import_excel';


// 従業員データを取得する関数
const fetchDepartments = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    const token = localStorage.getItem('token');
    return fetchData(`${API_BASE_URL}/api/general/department`, token, searchQuery, currentPage, itemsPerPage, 'departments');
};

// Excel出力する関数
const ExcelOutput = async (searchQuery) => {
    const token = localStorage.getItem('token');
    exportExcel(`${API_BASE_URL}/api/general/department/export_excel?searchQuery=${searchQuery}`, token);
};

// Excel入力する関数
const ExcelInput = async (loadData) => {
    const token = localStorage.getItem('token');
    importExcel(`${API_BASE_URL}/api/general/department/import_excel`, token, () => loadData());
};

const Department = () => (
    <TableMaster
        title='部署一覧'
        fetchData={fetchDepartments}
        TableComponent={DepartmentTable}
        modalTitle='部署登録'
        FormComponent={DepartmentForm}
        ExcelOutput={ExcelOutput}
        ExcelInput={ExcelInput}
    />
);

export default Department;
