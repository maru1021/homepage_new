import React from 'react';
import TableMaster from '../../script/table/TableMaster';
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';

// 従業員データを取得する関数
const fetchEmployees = async (query = "", page = 1, limit = 10) => {
    const response = await fetch(`http://localhost:8000/api/employees/?search=${query}&page=${page}&limit=${limit}`);
    if (response.ok) {
        const data = await response.json();
        return {
            tableDatas: data.employees || [],
            totalCount: data.totalCount || 0,
        };
    } else {
        return { employees: [], totalCount: 0 };
    }
};

const Employee = () => (
    <TableMaster
        title="従業員一覧"
        fetchData={fetchEmployees}
        TableComponent={EmployeeTable}
        modalTitle='従業員登録'
        FormComponent={EmployeeForm}
    />
);

export default Employee;
