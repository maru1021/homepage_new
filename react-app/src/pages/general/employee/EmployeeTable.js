import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import {
    API_BASE_URL,
    ConfirmDeleteModal,
    ContextMenu,
    Modal,
    setTableData,
    TableHeader,
    useContextMenu,
} from '../../../index/basicTableModules';

import EmployeeEditForm from './EmployeeEditForm';

import useModalManager from '../../../hooks/useModalManager'
import handleAPI from '../../../utils/handleAPI';


function EmployeeTable({ data, onSave, searchQuery, currentPage, itemsPerPage }) {
    const [employees, setEmployees] = useState(data);

    const {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
        menuRef,
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

    const handleEdit = () => {
        const employee = employees.find((emp) => emp.id === hoveredRowId);
        openModal(employee);
        setIsMenuVisible(false);
    };

    const handleDeleteEmployee = () => {
        const employee = employees.find((emp) => emp.id === hoveredRowId);
        openDeleteModal(employee);
        setIsMenuVisible(false);
    };

    const employeeDelete = async () => {
        const url = `${API_BASE_URL}/api/general/employee/${selectedItem.id}`
        handleAPI(url, 'DELETE', closeDeleteModal )
    };

    const handleSave = (updatedEmployee) => {
        closeModal();
        onSave(updatedEmployee);
    };

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon:<FaTrash color='#E57373' />, onClick: handleDeleteEmployee }
    ];

    const columns = ['部署', '社員番号', '名前', 'メールアドレス', '雇用情報', '性別', '住所',
        '電話番号', '生年月日', '入社日', '退社日', '契約満了日' ]

    return (
        <>
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 1800 }}>
                    <TableHeader columns={columns} />

                    <TableBody>
                        {data.length > 0 ?
                            (employees?.map((employee) => (
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
                                    <TableCell>{employee.name}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.info?.employment_type ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.gender ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.address ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.phone_number ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.birth_date ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.hire_date ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.leave_date ?? '-'}</TableCell>
                                    <TableCell>{employee.info?.contract_expiration ?? '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <Typography sx={{ textAlign: 'center', color: '#888' }}>
                                        データがありません
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {isMenuVisible && <ContextMenu position={menuPosition} actions={contextMenuActions} menuRef={menuRef} />}

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title='従業員情報編集'
                FormComponent={() => (
                    <EmployeeEditForm
                        employee={selectedItem}
                        onSuccess={handleSave}
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
        </>
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
                })
            ),
            info: PropTypes.shape({
                phone_number: PropTypes.string,
                gender: PropTypes.string,
                emergency_contact: PropTypes.string,
                address: PropTypes.string,
                birth_date: PropTypes.string,
                employment_type: PropTypes.string.isRequired,
                hire_date: PropTypes.string.isRequired,
                leave_date: PropTypes.string,
                contract_expiration: PropTypes.string,
            }),
        })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default EmployeeTable;
