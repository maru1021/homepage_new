import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import LineEditForm from './LineEditForm';
import LoadingAnimation from '../../../components/LoadingAnimation';
import DraggableRow from '../../../components/table/DraggableRow';

import { API_BASE_URL, WS_BASE_URL } from '../../../config/baseURL';
import { setTableData, TableHeader, useContextMenu } from '../../../index/basicTableModules';
import ContextMenu from '../../../components/ContextMenu';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';
import useAdminAccess from '../../../hooks/useAdminAccess';

function LineTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [lines, setLines] = useState(data);
    const [isLoading, setIsLoading] = useState(true);

    const {
        menuPosition,
        isMenuVisible,
        hoveredRowId,
        setIsMenuVisible,
        handleContextMenu: baseHandleContextMenu,
        menuRef,
    } = useContextMenu();

    const {
        wrapContextMenu
    } = useAdminAccess();

    const handleContextMenu = (event, id) => {
        const line = lines.find(line => line.id === id);
        if (line) {
            wrapContextMenu(baseHandleContextMenu)(event, id, "製造部");
        }
    };

    const url = `${API_BASE_URL}/api/manufacturing/line`

    const { handleEdit, handleDelete } = useContextMenuActions(
        lines,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "ライン編集",
        LineEditForm
    );

    setTableData(
        data,
        setLines,
        `${WS_BASE_URL}/ws/manufacturing/line`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
    );

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['ライン名', '有効']

    return (
        <>
            <TableContainer
                component={Paper}
                elevation={3}
            >
                <Table>
                    <TableHeader columns={columns} />

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ border: 'none' }}>
                                    <LoadingAnimation />
                                </TableCell>
                            </TableRow>
                        ) : lines.length > 0 ? (
                            lines.map((line, index) => (
                                <DraggableRow
                                    key={line.id}
                                    url={`${url}/sort`}
                                    data={{
                                        id: line.id,
                                        name: line.name,
                                        active: line.active ? '☑️' : '⬜'
                                    }}
                                    index={index}
                                    handleContextMenu={handleContextMenu}
                                    allData={lines}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <Typography sx={{
                                        textAlign: 'center',
                                        color: '#94a3b8',
                                        py: 4
                                    }}>
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

LineTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            active: PropTypes.bool.isRequired,
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default LineTable;
