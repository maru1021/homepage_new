import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper
} from "@mui/material";
import ContextMenu from '../../script/ContextMenu';
import Modal from '../../script/Modal';
import TableHeader from '../../script/table/TableHead';
import EmployeeEditForm from './EmployeeEditForm';
import ConfirmDeleteModal from '../../script/table/ConfirmDeleteModal';
import { successNoti, errorNoti } from '../../script/noti';

function EmployeeTable({ data, onSave }) {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
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
        const employee = data.find((emp) => emp.id === hoveredRowId);

        if (action === 'Edit') {
            setSelectedEmployee(employee);
            setIsModalOpen(true);
        } else if (action === 'Delete') {
            setSelectedEmployee(employee);
            setIsDeleteModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleDelete = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `http://localhost:8000/api/employees/${selectedEmployee.id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                method: 'DELETE',
            }
        );
        const data = await response.json();

        if (response.ok && data.success) {
            successNoti('削除成功に成功しました');
            onSave();
        } else {
            errorNoti('削除に失敗しました。');
        }
        closeDeleteModal();
    };

    const handleSave = (updatedEmployee) => {
        closeModal();
        onSave(updatedEmployee);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={["社員番号", "名前", "部署", "権限"]} />

                    <TableBody>
                        {data.map((employee) => (
                            <React.Fragment key={employee.id}>
                                {employee.departments.map((department, index) => (
                                    <TableRow
                                        key={`${employee.id}-${department.id}`}
                                        onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                        hover
                                        sx={{ transition: "0.3s", "&:hover": { backgroundColor: "#f5f5f5" } }}
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
                                        <TableCell>{department.admin ? "管理者" : "利用者"}</TableCell>
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
                title="従業員情報編集"
                FormComponent={() => (
                    <EmployeeEditForm
                        employee={selectedEmployee}
                        onSave={handleSave}
                    />
                )}
            />

            <ConfirmDeleteModal
                show={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                message={
                    selectedEmployee
                        ? `${selectedEmployee.employee_no}を削除してもよろしいですか？`
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
};

export default EmployeeTable;
