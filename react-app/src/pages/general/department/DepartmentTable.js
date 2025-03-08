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

import DepartmentEditForm from './DepartmentEditForm';
import LoadingAnimation from '../../../components/LoadingAnimation';

import { API_BASE_URL, WS_BASE_URL } from '../../../config/baseURL';
import { setTableData, TableHeader, useContextMenu } from '../../../index/basicTableModules';
import ContextMenu from '../../../components/ContextMenu';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';


function DepartmentTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [departments, setDepartments] = useState(data);
    const [isLoading, setIsLoading] = useState(true);

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

    setTableData(
        data,
        (newData) => {
            setDepartments(newData);
            setIsLoading(false);
        },
        `${WS_BASE_URL}/ws/general/department`,
        searchQuery,
        currentPage,
        itemsPerPage
    );

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['部署名']

    return (
        <>
            <TableContainer
                component={Paper}
                elevation={3}
                sx={{
                    overflowX: "auto",
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}
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
                        ) : departments.length > 0 ? (
                            departments.map((department) => (
                                <TableRow
                                    key={department.id}
                                    onContextMenu={(event) => handleContextMenu(event, department.id)}
                                    id={`department-row-${department.id}`}
                                    hover
                                    sx={{
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        {department.name}
                                    </TableCell>
                                </TableRow>
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
