import React from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ContextMenu({ position, onActionSelect }) {
    return (
        <div
            className="context-menu"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
            onClick={(e) => e.stopPropagation()} // 外部クリックの影響を防ぐ
        >
            <ul>
                <li onClick={() => onActionSelect('Edit')}>
                    <FaEdit className="edit-icon" />
                    編集
                </li>
                <li onClick={() => onActionSelect('Delete')}>
                    <FaTrash className="delete-icon" />
                    削除
                </li>
            </ul>
        </div>
    );
}

ContextMenu.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    onActionSelect: PropTypes.func.isRequired,
};

export default ContextMenu;
