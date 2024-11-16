import React from 'react';
import TableMaster from '../../script/table/TableMaster';
import DepartmentTable from './DepartmentTable';
import DepartmentForm from './DepartmentForm';

// 従業員データを取得する関数
const fetchDepartments = async (query = "", page = 1, limit = 10) => {
    const response = await fetch(`http://localhost:8000/api/departments/?search=${query}&page=${page}&limit=${limit}`);
    if (response.ok) {
        const data = await response.json();
        return {
            tableDatas: data.departments || [],
            totalCount: data.totalCount || 0,
        };
    } else {
        return { departments: [], totalCount: 0 };
    }
};

const Department = () => (
    <TableMaster
        title="部署一覧"
        fetchData={fetchDepartments}
        TableComponent={DepartmentTable}
        modalTitle='部署登録'
        FormComponent={DepartmentForm}
    />
);

export default Department;
