import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import DepartmentEditForm from './DepartmentEditForm';

import { API_BASE_URL, setTableData, TableHeader, useContextMenu } from '../../../index/basicTableModules';
import ContextMenu from '../../../components/ContextMenu';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';


function DepartmentTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [departments, setDepartments] = useState(data);

    const {
        menuPosition,
        isMenuVisible,
        hoveredRowId,
        handleContextMenu,
        setIsMenuVisible,
        menuRef,
    } = useContextMenu();

    const url = `${API_BASE_URL}/api/general/department`

    const { handleEdit, handleDelete } = useContextMenuActions(
        departments,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "部署編集",
        DepartmentEditForm
    );

    setTableData(data, setDepartments, `${API_BASE_URL.replace("http", "ws")}/ws/general/department`, searchQuery, currentPage, itemsPerPage);

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['部署名']

    return (
        <>
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto" }}>
                <Table>
                    <TableHeader columns={columns} />

                    <TableBody>
                        {data.length > 0 ? (
                            departments.map((department) => (
                                <TableRow
                                    key={department.id}
                                    onContextMenu={(event) => handleContextMenu(event, department.id)}
                                    id={`department-row-${department.id}`}
                                    hover
                                >
                                    <TableCell>
                                        {department.name}
                                    </TableCell>
                                </TableRow>
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

DepartmentTable.propTypes = {
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

export default DepartmentTable;
