import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography, CircularProgress
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import TypeEditForm from './TypeEditForm';

import {
    API_BASE_URL,
    ContextMenu,
    setTableData,
    TableHeader,
    useContextMenu,
} from '../../../index/basicTableModules';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';

// ドラッグ可能な行コンポーネント
const DraggableRow = ({ type, index, moveRow, handleContextMenu }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'ROW',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'ROW',
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveRow(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <TableRow
            ref={(node) => drag(drop(node))}
            onContextMenu={(event) => handleContextMenu(event, type.id)}
            hover
            sx={{
                transition: '0.3s',
                '&:hover': { backgroundColor: '#f5f5f5' },
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
            }}
        >
            <TableCell>{type.name}</TableCell>
            <TableCell align="right">{type.sort}</TableCell>
        </TableRow>
    );
};

DraggableRow.propTypes = {
    type: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        sort: PropTypes.number.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired,
    moveRow: PropTypes.func.isRequired,
    handleContextMenu: PropTypes.func.isRequired
};

function TypeTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [types, setTypes] = useState(data);
    const [loading, setLoading] = useState(false);

    const {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
        menuRef,
    } = useContextMenu();

    const url = `${API_BASE_URL}/api/homepage/type`

    const { handleEdit, handleDelete } = useContextMenuActions(
        types,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "項目編集",
        TypeEditForm
    );

    // 並び替え処理
    const moveRow = useCallback(async (dragIndex, hoverIndex) => {
        const draggedType = types[dragIndex];
        const updatedTypes = update(types, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, draggedType],
            ],
        });

        setTypes(updatedTypes);

        // 並び順を更新
        const updatedSortOrder = updatedTypes.map((type, index) => ({
            id: type.id,
            sort: (index + 1) * 1000,
        }));

        try {
            setLoading(true);
            await fetch(`${API_BASE_URL}/api/homepage/type/sort`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedSortOrder),
            });
        } catch (error) {
            console.error('Error updating sort order:', error);
        } finally {
            setLoading(false);
        }
    }, [types]);

    setTableData(data, setTypes, `${API_BASE_URL.replace("http", "ws")}/ws/homepage/type`, searchQuery, currentPage, itemsPerPage);

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon:<FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['項目', '並び順']

    return (
        <DndProvider backend={HTML5Backend}>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={columns} />
                    <TableBody>
                        {data.length > 0 ? (
                            types?.map((type, index) => (
                                <DraggableRow
                                    key={type.id}
                                    type={type}
                                    index={index}
                                    moveRow={moveRow}
                                    handleContextMenu={handleContextMenu}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <Typography sx={{ textAlign: 'center', color: '#888' }}>
                                        データがありません
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {loading && <CircularProgress sx={{ position: 'fixed', top: '50%', left: '50%' }} />}
            {isMenuVisible && <ContextMenu position={menuPosition} actions={contextMenuActions} menuRef={menuRef} />}
        </DndProvider>
    );
}

TypeTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            sort: PropTypes.number.isRequired
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default TypeTable;
