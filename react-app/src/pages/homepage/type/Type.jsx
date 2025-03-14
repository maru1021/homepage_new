import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import TypeTable from './TypeTable';
import TypeForm from './TypeForm';
import TableMaster from '../../../components/table/TableMaster';

import { API_BASE_URL } from '../../../config/baseURL';
import fetchData from '../../../utils/fetchData';


const fetchTypes = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/homepage/type`, searchQuery, currentPage, itemsPerPage, 'types');
};

const Type = () => (
    <DndProvider backend={HTML5Backend}>
        <TableMaster
            title='項目一覧'
            fetchData={fetchTypes}
            TableComponent={TypeTable}
            modalTitle='項目登録'
            FormComponent={TypeForm}
        />
    </DndProvider>
);

export default Type;
