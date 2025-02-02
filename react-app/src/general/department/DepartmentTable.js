import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ContextMenu from '../../script/ContextMenu';
import Modal from '../../script/Modal';
import ConfirmDeleteModal from '../../script/table/ConfirmDeleteModal';
import DepartmentEditForm from './DepartmentEditForm';
import { successNoti, errorNoti } from '../../script/noti';

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

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(
            `http://localhost:8000/api/departments/${selectedDepartment.id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                method: 'DELETE'
            }
        );
        const data = await response.json();

        if (response.ok && data.success) {
            successNoti('削除成功に成功しました');
            onSave();
        } else {
            errorNoti(data.message ?? '削除に失敗しました。');
        }
        closeDeleteModal();
    };

    const handleSave = (updatedDepartment) => {
        closeModal();
        onSave(updatedDepartment);
    };

    return (
        <div onClick={() => setIsMenuVisible(false)} style={{ position: 'relative' }}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>部署名</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((department) => (
                        <tr
                            key={department.id}
                            onContextMenu={(event) => handleContextMenu(event, department.id)}
                            id={`department-row-${department.id}`}
                        >
                            <td>{department.name}</td>
                        </tr>
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
                onConfirm={handleDelete}
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
