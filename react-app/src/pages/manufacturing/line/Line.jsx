import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { API_BASE_URL } from '../../../config/baseURL';
import LineForm from './LineForm';
import LineTable from './LineTable'
import TableMaster from '../../../components/table/TableMaster';

import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';
import importExcel from '../../../utils/Excel/import_excel';


const fetchLines = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/manufacturing/line`, searchQuery, currentPage, itemsPerPage, 'lines');
};

const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/manufacturing/line/export_excel?searchQuery=${searchQuery}`);
};

const ExcelInput = async () => {
    importExcel(`${API_BASE_URL}/api/manufacturing/line/import_excel`);
};

const Line = () => (
    <DndProvider backend={HTML5Backend}>
        <TableMaster
            title='ライン一覧'
            fetchData={fetchLines}
            TableComponent={LineTable}
            modalTitle='ライン登録'
            FormComponent={LineForm}
            ExcelOutput={ExcelOutput}
            ExcelInput={ExcelInput}
        />
    </DndProvider>
);

export default Line;
