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
import DraggableRow from '../../../components/table/DraggableRow';

import { API_BASE_URL, WS_BASE_URL } from '../../../config/baseURL';
import { setTableData, TableHeader, useContextMenu } from '../../../index/basicTableModules';
import ContextMenu from '../../../components/ContextMenu';
import { useContextMenuActions } from '../../../hooks/useContextMenuActions';
import useAdminAccess from '../../../hooks/useAdminAccess';

function DepartmentTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [departments, setDepartments] = useState(data);
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
        const department = departments.find(dept => dept.id === id);
        if (department) {
            wrapContextMenu(baseHandleContextMenu)(event, id, "総務部");
        }
    };

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
        setDepartments,
        `${WS_BASE_URL}/ws/general/department`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
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
                            departments.map((department, index) => (
                                <DraggableRow
                                    key={department.id}
                                    url={`${url}/sort`}
                                    data={{ id: department.id, name: department.name }}
                                    index={index}
                                    handleContextMenu={handleContextMenu}
                                    allData={departments}
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
