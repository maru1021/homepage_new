import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import TypeEditForm from './TypeEditForm';
import LoadingAnimation from '../../../components/LoadingAnimation';
import DraggableRow from '../../../components/table/DraggableRow';

import { API_BASE_URL, WS_BASE_URL } from '../../../config/baseURL';
import {
    ContextMenu,
    setTableData,
    TableHeader,
    useContextMenu,
} from '../../../index/basicTableModules';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';
import { successNoti } from '../../../utils/noti';


function TypeTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [types, setTypes] = useState(data);
    const [isLoading, setIsLoading] = useState(true);

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


    setTableData(
        data,
        setTypes,
        `${WS_BASE_URL}/ws/api/homepage/type`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
    );


    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon:<FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['項目']

    // 行の並び替え処理を修正
    const moveRow = async (dragIndex, hoverIndex) => {
        const draggedRow = types[dragIndex];
        const newTypes = [...types];
        newTypes.splice(dragIndex, 1);
        newTypes.splice(hoverIndex, 0, draggedRow);
        const updatedTypes = newTypes.map((type, index) => ({
            ...type,
            sort: index + 1
        }));

        try {
            // 並び替え後の順序でsortを更新
            const updatedOrder = updatedTypes.map((type, index) => ({
                id: type.id,
                order: index + 1  // type.sortではなく、新しい順序（index + 1）を使用
            }));

            const response = await fetch(`${API_BASE_URL}/api/homepage/type/sort`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedOrder)
            });

            if (response.ok) {
                successNoti('並び替えが完了しました');
            } else {
                throw new Error('Failed to update order');
            }



        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    return (
        <>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={columns} />
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ border: 'none' }}>
                                    <LoadingAnimation />
                                </TableCell>
                            </TableRow>
                        ) : types.length > 0 ?
                            (types?.map((type, index) => (
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

            {isMenuVisible && <ContextMenu position={menuPosition} actions={contextMenuActions} menuRef={menuRef} />}
        </>
    );
}

TypeTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default TypeTable;
