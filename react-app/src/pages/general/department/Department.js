import React from 'react';

import API_BASE_URL from '../../../config/baseURL';
import DepartmentForm from './DepartmentForm';
import DepartmentTable from './DepartmentTable'
import TableMaster from '../../../script/table/TableMaster';

import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';
import importExcel from '../../../utils/Excel/import_excel';


// 従業員データを取得する関数
const fetchDepartments = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/general/department`, searchQuery, currentPage, itemsPerPage, 'departments');
};

// Excel出力する関数
const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/general/department/export_excel?searchQuery=${searchQuery}`);
};

// Excel入力する関数
const ExcelInput = async () => {
    importExcel(`${API_BASE_URL}/api/general/department/import_excel`);
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
