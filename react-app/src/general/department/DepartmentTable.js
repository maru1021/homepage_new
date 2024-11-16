import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash } from 'react-icons/fa';

function DepartmentTable({ data }) {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);

    // 右クリック時のメニュー表示処理
    const handleContextMenu = (event, rowId) => {
        event.preventDefault();
        setMenuPosition({
            x: event.clientX - 200,
            y: event.clientY - 200
        });
        setSelectedRowId(rowId);
        setIsMenuVisible(true);
    };

    // メニューの項目をクリックしたときの処理
    const handleMenuClick = (action) => {
        console.log(`Selected action: ${action} on row ${selectedRowId}`);
        setIsMenuVisible(false);
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

            {/* コンテキストメニュー */}
            {isMenuVisible && (
                <div
                    className="context-menu"
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        zIndex: 1000,
                        minWidth: '120px',
                        padding: '0.5em 0',
                    }}
                >
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li
                            onClick={() => handleMenuClick('Edit')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <FaEdit style={{ marginRight: '8px', color: '#007bff' }} />
                            編集
                        </li>
                        <li
                            onClick={() => handleMenuClick('Delete')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <FaTrash style={{ marginRight: '8px', color: '#dc3545' }} />
                            削除
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

DepartmentTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
};

export default DepartmentTable;
