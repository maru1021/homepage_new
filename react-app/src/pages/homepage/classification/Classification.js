import React from 'react';

import ClassificationTable from './ClassificationTable';
import ClassificationForm from './ClassificationForm';
import TableMaster from '../../../components/table/TableMaster';

import API_BASE_URL from '../../../config/baseURL';
import fetchData from '../../../utils/fetchData';


const fetchClassifications = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/homepage/classification`, searchQuery, currentPage, itemsPerPage, 'classifications');
};

const Classification = () => (
    <TableMaster
        title='分類一覧'
        fetchData={fetchClassifications}
        TableComponent={ClassificationTable}
        modalTitle='分類登録'
        FormComponent={ClassificationForm}
    />
);

export default Classification;
