import React from 'react';
import fetchData from '../../script/table/fetchData';
import TableMaster from '../../script/table/TableMaster';
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmployeeForm';

// 従業員データを取得する関数
const fetchEmployees = async (query = "", page = 1, limit = 10) => {
    const token = localStorage.getItem("token");
    return fetchData("http://localhost:8000/api/employees", token, query, page, limit, "employees");
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
