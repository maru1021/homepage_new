import { useState } from 'react';

const useContextMenu = () => {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const handleContextMenu = (event, rowId) => {
        event.preventDefault();
        setMenuPosition({
            x: event.clientX - 200,
            y: event.clientY - 200,
        });
        setHoveredRowId(rowId);
        setIsMenuVisible(true);
    };

    return {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
    };
};

export default useContextMenu;
