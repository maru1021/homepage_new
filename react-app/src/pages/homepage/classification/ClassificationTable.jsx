import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import ClassificationEditForm from './ClassificationEditForm';
import LoadingAnimation from '../../../components/LoadingAnimation';
import DraggableRow from '../../../components/table/DraggableRow';

import {
    API_BASE_URL,
    WS_BASE_URL,
} from '../../../config/baseURL';
import {
    ContextMenu,
    setTableData,
    TableHeader,
    useContextMenu,
} from '../../../index/basicTableModules';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';


function ClassificationTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [classifications, setClassifications] = useState(data);
    const [isLoading, setIsLoading] = useState(true);

    const {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu,
        menuRef,
    } = useContextMenu();

    const url = `${API_BASE_URL}/api/homepage/classification`

    const { handleEdit, handleDelete } = useContextMenuActions(
        classifications,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "分類編集",
        ClassificationEditForm
    );

    setTableData(data,
        setClassifications,
        `${WS_BASE_URL}/ws/api/homepage/classification`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
    );

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon:<FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['項目', '分類']

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
                        ) : classifications.length > 0 ?
                            (classifications?.map((classification, index) => (
                                <DraggableRow
                                    key={classification.id}
                                    url={`${url}/sort`}
                                    data={classification}
                                    index={index}
                                    handleContextMenu={handleContextMenu}
                                    allData={classifications}
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

ClassificationTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            type_name: PropTypes.string,
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default ClassificationTable;