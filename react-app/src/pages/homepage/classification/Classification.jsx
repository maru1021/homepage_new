import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ClassificationTable from './ClassificationTable';
import ClassificationForm from './ClassificationForm';
import TableMaster from '../../../components/table/TableMaster';

import { API_BASE_URL } from '../../../config/baseURL';
import fetchData from '../../../utils/fetchData';


const fetchClassifications = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/api/homepage/classification`, searchQuery, currentPage, itemsPerPage, 'classifications');
};

const Classification = () => (
    <DndProvider backend={HTML5Backend}>
        <TableMaster
            title='分類一覧'
            fetchData={fetchClassifications}
            TableComponent={ClassificationTable}
            modalTitle='分類登録'
            FormComponent={ClassificationForm}
        />
    </DndProvider>
);

export default Classification;
