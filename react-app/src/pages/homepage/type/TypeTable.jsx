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
                                    url={`${url}/sort`}
                                    data={type}
                                    index={index}
                                    handleContextMenu={handleContextMenu}
                                    allData={types}
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
