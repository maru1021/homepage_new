import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import { API_BASE_URL, ConfirmDeleteModal, Modal, setTableData, TableHeader, useContextMenu } from '../../../index/basicTableModules';
import useModalManager from '../../../hooks/useModalManager';
import ContextMenu from '../../../components/ContextMenu';
import DepartmentEditForm from './DepartmentEditForm';
import handleAPI from '../../../utils/handleAPI';


function DepartmentTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [departments, setDepartments] = useState(data);

    const {
        menuPosition,
        isMenuVisible,
        hoveredRowId,
        handleContextMenu,
        setIsMenuVisible,
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

    setTableData(data, setDepartments, `${API_BASE_URL.replace("http", "ws")}/ws/general/department`, searchQuery, currentPage, itemsPerPage);

    const handleEdit = () => {
        const department = departments.find((dept) => dept.id === hoveredRowId);
        openModal(department);
        setIsMenuVisible(false);
    };

    const handleDeleteDepartment = () => {
        const department = departments.find((dept) => dept.id === hoveredRowId);
        openDeleteModal(department);
        setIsMenuVisible(false);
    };

    const departmentDelete = async () => {
        const url = `${API_BASE_URL}/api/general/department/${selectedItem.id}`
        handleAPI(url, 'DELETE', closeDeleteModal )
    };

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDeleteDepartment }
    ];

    return (
        <>
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto" }}>
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

            {isMenuVisible && <ContextMenu position={menuPosition} actions={contextMenuActions} menuRef={menuRef} />}

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title='部署情報編集'
                FormComponent={() => (
                    <DepartmentEditForm
                        department={selectedItem}
                        onSuccess={closeModal}
                    />
                )}
            />

            <ConfirmDeleteModal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={departmentDelete}
                message={selectedItem ? `${selectedItem.name}を削除してもよろしいですか？` : '選択された部署が見つかりません。'}
            />
        </>
    );
}

DepartmentTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default DepartmentTable;
