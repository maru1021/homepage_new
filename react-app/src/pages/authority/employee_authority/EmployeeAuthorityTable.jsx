import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

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

import EmployeeAuthorityEditForm from './EmployeeAuthorityEditForm';
import LoadingAnimation from '../../../components/LoadingAnimation';

import { useContextMenuActions } from '../../../hooks/useContextMenuActions';
import useAdminAccess from '../../../hooks/useAdminAccess';


function EmployeeAuthorityTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [employees, setEmployees] = useState(data);
    const [isLoading, setIsLoading] = useState(true);

    const {
        menuPosition,
        hoveredRowId,
        isMenuVisible,
        setIsMenuVisible,
        handleContextMenu: baseHandleContextMenu,
        menuRef,
    } = useContextMenu();

    const {
        wrapContextMenu
    } = useAdminAccess();

    const handleContextMenu = (event, id) => {
        const employee = employees.find(emp => emp.id === id);
        if (employee && employee.departments.length > 0) {
            wrapContextMenu(baseHandleContextMenu)(event, id, "情報システム室");
        }
    };

    const url = `${API_BASE_URL}/api/authority/employee_authority`

    const { handleEdit, handleDelete } = useContextMenuActions(
        employees,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "権限編集",
        EmployeeAuthorityEditForm
    );

    setTableData(data,
        setEmployees,
        `${WS_BASE_URL}/ws/authority/employee_authority`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
    );

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon: <FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['部署', '権限', '社員番号', '名前', 'メールアドレス'];

    if (isLoading) {
        return (
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={columns} />
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={columns.length} sx={{ border: 'none' }}>
                                <LoadingAnimation />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <>
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHeader columns={columns} />

                    <TableBody>
                        {employees.length > 0 ? (
                            employees?.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    onContextMenu={(event) => handleContextMenu(event, employee.id)}
                                    hover
                                    sx={{
                                        transition: '0.3s',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        {employee.departments.map((department) => (
                                            <div key={`dep-name-${employee.id}-${department.id}`}>
                                                {department.name}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {employee.departments.map((department) => (
                                            <div key={`dep-admin-${employee.id}-${department.id}`}>
                                                {department.admin ? '管理者' : '利用者'}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>{employee.employee_no}</TableCell>
                                    <TableCell>{employee.name}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
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

            {isMenuVisible && (
                <ContextMenu position={menuPosition} actions={contextMenuActions} menuRef={menuRef} />
            )}
        </>
    );
}

EmployeeAuthorityTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            employee_no: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string,
            departments: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.number.isRequired,
                    name: PropTypes.string.isRequired,
                    admin: PropTypes.bool.isRequired,
                })
            ),
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default EmployeeAuthorityTable;
