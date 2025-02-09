import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableRow
} from '@mui/material';

import DepartmentEditForm from './DepartmentEditForm';

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
import useModalManager from '../../script/modal/useModalManager'


function DepartmentTable({ data, onSave, searchQuery, currentPage, itemsPerPage }) {
    const [departments, setDepartments] = useState(data);

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

    setTableData(data, setDepartments, `${API_BASE_URL.replace("http", "ws")}/ws/general/department`, searchQuery, currentPage, itemsPerPage);

    const handleMenuAction = (action) => {
        const department = departments.find((depart) => depart.id === hoveredRowId);

        if (action === 'Edit') {
            openModal(department);
        } else if (action === 'Delete') {
            openDeleteModal(department);
        }
    };

    const departmentDelete = async () => {
        handleDelete(`${API_BASE_URL}/api/general/department/${selectedItem.id}`, onSave, closeDeleteModal);
    };

    const handleSave = (updatedDepartment) => {
        closeModal();
        onSave(updatedDepartment);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={['部署名']} />

                    <TableBody>
                        {departments?.map((department) => (
                            <TableRow
                                key={department.id}
                                onContextMenu={(event) => handleContextMenu(event, department.id)}
                                id={`department-row-${department.id}`}
                                hover
                            >
                                <TableCell>
                                    {department.name}
                                </TableCell>
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
                title='部署情報編集'
                FormComponent={() => (
                    <DepartmentEditForm
                        department={selectedItem}
                        onSave={handleSave}
                    />
                )}
            />

            <ConfirmDeleteModal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={departmentDelete}
                message={
                    selectedItem
                        ? `${selectedItem.name}を削除してもよろしいですか？`
                        : '選択された部署が見つかりません。'
                }
            />
        </div>
    );
}

DepartmentTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default DepartmentTable;
