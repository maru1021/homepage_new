import { useState, useEffect, useRef } from 'react';

const useContextMenu = () => {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const menuRef = useRef(null); // メニューの要素を取得するためのref

    const handleContextMenu = (event, rowId) => {
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setHoveredRowId(rowId);
        setIsMenuVisible(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuVisible(false);
            }
        };

        if (isMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuVisible]);

    return {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
        menuRef,
    };
};

export default useContextMenu