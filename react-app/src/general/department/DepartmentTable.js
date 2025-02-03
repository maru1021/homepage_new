import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper
} from "@mui/material";
import ContextMenu from '../../script/ContextMenu';
import Modal from '../../script/Modal';
import TableHeader from '../../script/table/TableHead';
import ConfirmDeleteModal from '../../script/table/ConfirmDeleteModal';
import DepartmentEditForm from './DepartmentEditForm';
import handleDelete from '../../script/handleDelete';
import API_BASE_URL from "../../baseURL";

function DepartmentTable({ data, onSave }) {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleContextMenu = (event, rowId) => {
        event.preventDefault();
        setMenuPosition({
            x: event.clientX - 200,
            y: event.clientY - 200,
        });
        setHoveredRowId(rowId);
        setIsMenuVisible(true);
    };

    const handleMenuAction = (action) => {
        setTimeout(() => setIsMenuVisible(false), 0);
        const department = data.find((depart) => depart.id === hoveredRowId);

        if (action === 'Edit') {
            setSelectedDepartment(department);
            setIsModalOpen(true);
        } else if (action === 'Delete') {
            setSelectedDepartment(department);
            setIsDeleteModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDepartment(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedDepartment(null);
    };

    const departmentDelete = async () => {
        handleDelete(`${API_BASE_URL}/api/departments/${selectedDepartment.id}`, onSave, closeDeleteModal);
    };

    const handleSave = (updatedDepartment) => {
        closeModal();
        onSave(updatedDepartment);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={["部署名"]} />

                    <TableBody>
                        {data.map((department) => (
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
                title="部署情報編集"
                FormComponent={() => (
                    <DepartmentEditForm
                        department={selectedDepartment}
                        onSave={handleSave}
                    />
                )}
            />

            <ConfirmDeleteModal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={departmentDelete}
                message={
                    selectedDepartment
                        ? `${selectedDepartment.name}を削除してもよろしいですか？`
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
};

export default DepartmentTable;
