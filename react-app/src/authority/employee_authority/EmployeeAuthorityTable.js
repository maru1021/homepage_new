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

import EmployeeAuthorityEditForm from './EmployeeAuthorityEditForm';

import useModalManager from '../../script/modal/useModalManager'


function EmployeeAuthorityTable({ data, onSave, searchQuery, currentPage, itemsPerPage }) {
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

    setTableData(data, setEmployees, `${API_BASE_URL.replace("http", "ws")}/ws/authority/employee_authority`, searchQuery, currentPage, itemsPerPage);

    const handleMenuAction = (action) => {
        const employee = employees.find((emp) => emp.id === hoveredRowId);

        if (action === 'Edit') {
            openModal(employee);
        } else if (action === 'Delete') {
            openDeleteModal(employee);
        }
    };

    const employeeDelete = async () => {
        handleDelete(`${API_BASE_URL}/api/authority/employee_authority/${selectedItem.id}`, onSave, closeDeleteModal);
    };

    const handleSave = (updatedEmployee) => {
        closeModal();
        onSave(updatedEmployee);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={['社員番号', '名前', '部署', '権限']} />

                    <TableBody>
                        {employees?.map((employee) => (
                            <React.Fragment key={employee.id}>
                                {employee.departments.map((department, index) => (
                                    <TableRow
                                        key={`${employee.id}-${department.id}`}
                                        onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                        hover
                                        sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                    >
                                        {index === 0 && (
                                            <>
                                                <TableCell rowSpan={employee.departments.length}>
                                                    {employee.employee_no}
                                                </TableCell>
                                                <TableCell rowSpan={employee.departments.length}>
                                                    {employee.name}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell>{department.admin ? '管理者' : '利用者'}</TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
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
                    <EmployeeAuthorityEditForm
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

EmployeeAuthorityTable.propTypes = {
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

export default EmployeeAuthorityTable;
