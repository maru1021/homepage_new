import React from 'react';

import MachineTable from './MachineTable';
import MachineForm from './MachineForm';
import TableMaster from '../../../components/table/TableMaster';

import { API_BASE_URL } from '../../../config/baseURL';
import exportExcel from '../../../utils/Excel/export_excel';
import fetchData from '../../../utils/fetchData';


const fetchMachines = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/manufacturing/machine`, searchQuery, currentPage, itemsPerPage, 'machines');
};

const ExcelOutput = async (searchQuery) => {
    exportExcel(`${API_BASE_URL}/api/manufacturing/machine/export_excel?searchQuery=${searchQuery}`);
};

const Machine = () => (
    <TableMaster
        title='設備一覧'
        fetchData={fetchMachines}
        TableComponent={MachineTable}
        modalTitle='設備登録'
        FormComponent={MachineForm}
        ExcelOutput={ExcelOutput}
    />
);

export default Machine;
