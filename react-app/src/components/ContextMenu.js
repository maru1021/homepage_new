import React from 'react';
import PropTypes from 'prop-types';

function ContextMenu({ position, actions, menuRef }) {
    return (
        <div
            ref={menuRef} // useContextMenu の menuRef を適用
            className="context-menu"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                position: 'absolute',
                background: 'white',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '8px',
                zIndex: 1000,
            }}
        >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {actions.map((action, index) => (
                    <li
                        key={index}
                        onClick={() => {
                            action.onClick();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            cursor: 'pointer',
                            borderBottom: index !== actions.length - 1 ? '1px solid #ddd' : 'none',
                        }}
                    >
                        {action.icon}
                        <span style={{ marginLeft: '8px' }}>{action.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

ContextMenu.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            icon: PropTypes.node.isRequired,
            onClick: PropTypes.func.isRequired,
        })
    ).isRequired,
    menuRef: PropTypes.object.isRequired,
};

export default ContextMenu;
