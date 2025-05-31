import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { API_BASE_URL } from '../../../config/baseURL';
import DepartmentForm from './LineForm';
import DepartmentTable from './LineTable'
import TableMaster from '../../../components/table/TableMaster';

import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';
import importExcel from '../../../utils/Excel/import_excel';


const fetchDepartments = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/general/department`, searchQuery, currentPage, itemsPerPage, 'departments');
};

const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/general/department/export_excel?searchQuery=${searchQuery}`);
};

const ExcelInput = async () => {
    importExcel(`${API_BASE_URL}/api/general/department/import_excel`);
};

const Department = () => (
    <DndProvider backend={HTML5Backend}>
        <TableMaster
            title='部署一覧'
            fetchData={fetchDepartments}
            TableComponent={DepartmentTable}
            modalTitle='部署登録'
            FormComponent={DepartmentForm}
            ExcelOutput={ExcelOutput}
            ExcelInput={ExcelInput}
        />
    </DndProvider>
);

export default Department;
