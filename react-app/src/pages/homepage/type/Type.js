import React from 'react';

import TypeTable from './TypeTable';
import TypeForm from './TypeForm';
import TableMaster from '../../../components/table/TableMaster';

import { API_BASE_URL } from '../../../config/baseURL';
import fetchData from '../../../utils/fetchData';


const fetchTypes = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
    return fetchData(`${API_BASE_URL}/homepage/type`, searchQuery, currentPage, itemsPerPage, 'types');
};

const Type = () => (
    <TableMaster
        title='項目一覧'
        fetchData={fetchTypes}
        TableComponent={TypeTable}
        modalTitle='項目登録'
        FormComponent={TypeForm}
    />
);

export default Type;
