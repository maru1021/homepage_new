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

import EmployeeAuthorityEditForm from './EmployeeAuthorityEditForm';

import useModalManager from '../../../hooks/useModalManager'
import handleAPI from '../../../utils/handleAPI';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';


function EmployeeAuthorityTable({ data, searchQuery, currentPage, itemsPerPage }) {
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

    setTableData(data, setEmployees, `${API_BASE_URL.replace("http", "ws")}/ws/authority/employee_authority`, searchQuery, currentPage, itemsPerPage);

    const { handleEdit, handleDelete } = useContextMenuActions(
        employees,
        hoveredRowId,
        openModal,
        openDeleteModal,
        setIsMenuVisible
    );

    const employeeDelete = async () => {
        const url = `${API_BASE_URL}/api/authority/employee_authority/${selectedItem.id}`
        handleAPI(url, 'DELETE', closeDeleteModal )
    };

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['部署', '権限', '社員番号', '名前', 'メールアドレス'];

    return (
        <>
            <TableContainer component={Paper} elevation={3}>
            <Table>
                <TableHeader columns={columns} />

                <TableBody>
                    {data.length > 0 ? (
                        employees?.map((employee) => (
                            <TableRow
                                key={employee.id}
                                onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                hover
                                sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>
                                    {employee.departments.map((department) => (
                                        <div key={`dep-name-${employee.id}-${department.id}`}>
                                            {department.name}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell>
                                    {employee.departments.map((department) => (
                                        <div key={`dep-admin-${employee.id}-${department.id}`}>
                                            {department.admin ? '管理者' : '利用者'}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell>{employee.employee_no}</TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.email}</TableCell>
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
                    <EmployeeAuthorityEditForm
                        employee={selectedItem}
                        onSuccess={closeModal}
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

EmployeeAuthorityTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            employee_no: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string,
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

export default EmployeeAuthorityTable;
