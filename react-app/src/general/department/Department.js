import React from 'react';
import TableMaster from '../../script/table/TableMaster';
import fetchData from '../../script/table/fetchData';
import DepartmentTable from './DepartmentTable';
import DepartmentForm from './DepartmentForm';
import exportExcel from '../../script/Excel/export_excel';
import importExcel from '../../script/Excel/import_excel';
import API_BASE_URL from '../../baseURL';

// 従業員データを取得する関数
const fetchDepartments = async (query = '', page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    return fetchData(`${API_BASE_URL}/api/departments`, token, query, page, limit, 'departments');
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
