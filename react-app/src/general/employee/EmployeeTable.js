import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ContextMenu from '../../script/ContextMenu'; // コンテキストメニューをインポート
import Modal from '../../script/Modal'; // モーダルをインポート
import EmployeeEditForm from './EmployeeEditForm'; // 編集フォームをインポート

function EmployeeTable({ data }) {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの表示状態
    const [selectedEmployee, setSelectedEmployee] = useState(null); // 編集対象の従業員

    // コンテキストメニューの位置調整、表示
    // 編集削除のためにidの情報を持たせる
    const handleContextMenu = (event, rowId) => {
        event.preventDefault();
        setMenuPosition({
            x: event.clientX -200,
            y: event.clientY -200,
        });
        setHoveredRowId(rowId); // メニューが関連する行を追跡
        setIsMenuVisible(true);
    };

    // コンテキストメニュークリック時の処理
    const handleMenuAction = (action) => {
        console.log(`Selected action: ${action} on row ${hoveredRowId}`);
        setIsMenuVisible(false);

        if (action === 'Edit') {
            const employee = data.find((emp) => emp.id === hoveredRowId);
            console.log(selectedEmployee)
            setSelectedEmployee(employee); // 編集対象の従業員を設定
            setIsModalOpen(true); // モーダルを表示
        }
    };

    const closeModal = () => {
        setIsModalOpen(false); // モーダルを閉じる
        setSelectedEmployee(null); // 編集対象をリセット
    };

    const handleSave = (updatedData) => {
        console.log('Updated data:', updatedData);
        closeModal(); // 保存後にモーダルを閉じる
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
                    {data.map((employee) => {
                        const departmentCount = employee.departments.length;
                        return (
                            <React.Fragment key={employee.id}>
                                {employee.departments.length > 0
                                    ? employee.departments.map((department, index) => (
                                          <tr
                                              key={`${employee.id}-${department.id}`}
                                              onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                              className={hoveredRowId === employee.id ? 'hovered-row' : ''}
                                          >
                                              {index === 0 && (
                                                  <>
                                                      <td rowSpan={departmentCount}>{employee.employee_no}</td>
                                                      <td rowSpan={departmentCount}>{employee.name}</td>
                                                  </>
                                              )}
                                              <td>{department.name}</td>
                                              <td>{department.admin ? '管理者' : '利用者'}</td>
                                          </tr>
                                      ))
                                    : (
                                        <tr
                                            key={`employee-no-department-${employee.id}`}
                                            onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                            className={hoveredRowId === employee.id ? 'hovered-row' : ''}
                                        >
                                            <td>{employee.employee_no}</td>
                                            <td>{employee.name}</td>
                                            <td>部署なし</td>
                                            <td>権限なし</td>
                                        </tr>
                                    )}
                            </React.Fragment>
                        );
                    })}
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
                onRegister={handleSave}
                title="従業員情報編集"
                FormComponent={() => <EmployeeEditForm employee={selectedEmployee} onSave={handleSave} />}
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
            ).isRequired,
        })
    ).isRequired,
};

export default EmployeeTable;
