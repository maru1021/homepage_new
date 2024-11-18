import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ContextMenu from '../../script/ContextMenu';
import Modal from '../../script/Modal';
import EmployeeEditForm from './EmployeeEditForm';
import ConfirmDeleteModal from './ConfirmDeleteModal.js';
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
        const response = await fetch(
            `http://localhost:8000/api/employees/${selectedEmployee.id}`,
            { method: 'DELETE' }
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
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>社員番号</th>
                        <th>名前</th>
                        <th>部署</th>
                        <th>権限</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((employee) => (
                        <React.Fragment key={employee.id}>
                            {employee.departments.map((department, index) => (
                                <tr
                                    key={`${employee.id}-${department.id}`}
                                    onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                >
                                    {index === 0 && (
                                        <>
                                            <td rowSpan={employee.departments.length}>{employee.employee_no}</td>
                                            <td rowSpan={employee.departments.length}>{employee.name}</td>
                                        </>
                                    )}
                                    <td>{department.name}</td>
                                    <td>{department.admin ? '管理者' : '利用者'}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

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
