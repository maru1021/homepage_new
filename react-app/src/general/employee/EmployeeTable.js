import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper
} from '@mui/material';
import {
    API_BASE_URL,
    ConfirmDeleteModal,
    ContextMenu,
    handleDelete,
    Modal,
    setTableData,
    TableHeader,
    useContextMenu,
} from '../../script/table/basicTableModules';

import EmployeeEditForm from './EmployeeEditForm';

import useModalManager from '../../script/modal/useModalManager'


function EmployeeTable({ data, onSave, searchQuery, currentPage, itemsPerPage }) {
    const [employees, setEmployees] = useState(data);

    const {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
    } = useContextMenu();

    const {
        isModalOpen,
        isDeleteModalOpen,
        selectedItem,
        openModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
    } = useModalManager();

    setTableData(data, setEmployees, `${API_BASE_URL.replace("http", "ws")}/ws/general/employee`, searchQuery, currentPage, itemsPerPage);

    const handleMenuAction = (action) => {
        const employee = employees.find((emp) => emp.id === hoveredRowId);

        if (action === 'Edit') {
            openModal(employee);
        } else if (action === 'Delete') {
            openDeleteModal(employee);
        }
    };

    const employeeDelete = async () => {
        handleDelete(`${API_BASE_URL}/api/general/employee/${selectedItem.id}`, onSave, closeDeleteModal);
    };

    const handleSave = (updatedEmployee) => {
        closeModal();
        onSave(updatedEmployee);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 1800 }}>
                    <TableHeader columns={['部署', '社員番号', '雇用情報', '名前', '性別', '住所',
                        '電話番号', '生年月日', '入社日', '退職日', '契約満了日' ]} />

                    <TableBody>
                        {employees?.map((employee) => (
                            <TableRow
                                key={employee.id}
                                onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                hover
                                sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>
                                    {employee.departments.map((department) => (
                                        <div key={department.id}>{department.name}</div>
                                    ))}
                                </TableCell>
                                <TableCell>{employee.employee_no}</TableCell>
                                <TableCell>{employee.info?.employment_type ?? '-'}</TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.info?.gender ?? '-'}</TableCell>
                                <TableCell>{employee.info?.address ?? '-'}</TableCell>
                                <TableCell>{employee.info?.phone_number ?? '-'}</TableCell>
                                <TableCell>{employee.info?.birth_date ?? '-'}</TableCell>
                                <TableCell>{employee.info?.hire_date ?? '-'}</TableCell>
                                <TableCell>{employee.info?.leave_date ?? '-'}</TableCell>
                                <TableCell>{employee.info?.contract_expiration ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {isMenuVisible && (
                <ContextMenu
                    position={menuPosition}
                    onActionSelect={handleMenuAction}
                />
            )}

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title='従業員情報編集'
                FormComponent={() => (
                    <EmployeeEditForm
                        employee={selectedItem}
                        onSave={handleSave}
                    />
                )}
            />

            <ConfirmDeleteModal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={employeeDelete}
                message={
                    selectedItem
                        ? `${selectedItem.employee_no}を削除してもよろしいですか？`
                        : '選択された従業員が見つかりません。'
                }
            />
        </div>
    );
}

EmployeeTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            employee_no: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            departments: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.number.isRequired,
                    name: PropTypes.string.isRequired,
                    admin: PropTypes.bool.isRequired,
                })
            ),
        })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default EmployeeTable;
