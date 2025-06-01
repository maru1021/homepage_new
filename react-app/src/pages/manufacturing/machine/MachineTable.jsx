import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Table, TableBody, TableCell, TableContainer,
    TableRow, Paper, Typography
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

import MachineEditForm from './MachineEditForm';
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
import useAdminAccess from '../../../hooks/useAdminAccess';


function MachineTable({ data, searchQuery, currentPage, itemsPerPage }) {
    const [machines, setMachines] = useState(data);
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
        const machine = machines.find(machine => machine.id === id);
        if (machine) {
            wrapContextMenu(baseHandleContextMenu)(event, id, "製造部");
        }
    };

    const url = `${API_BASE_URL}/api/manufacturing/machine`

    const { handleEdit, handleDelete } = useContextMenuActions(
        machines,
        hoveredRowId,
        url,
        "name",
        setIsMenuVisible,
        "設備編集",
        MachineEditForm
    );

    setTableData(data,
        setMachines,
        `${WS_BASE_URL}/ws/manufacturing/machine`,
        searchQuery,
        currentPage,
        itemsPerPage,
        setIsLoading
    );

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        { label: '削除', icon:<FaTrash color='#E57373' />, onClick: handleDelete }
    ];

    const columns = ['ライン', '名前', '有効']

    return (
        <DndProvider backend={HTML5Backend}>
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
                            ) : machines.length > 0 ? (
                                machines.map((machine, index) => (
                                    <DraggableRow
                                        key={machine.id}
                                        url={`${url}/sort`}
                                        data={{
                                            line_name: machine.line?.name || '',
                                            name: machine.name,
                                            active: machine.active ? '☑️' : '⬜',
                                            id: machine.id
                                        }}
                                        index={index}
                                        handleContextMenu={handleContextMenu}
                                        allData={machines}
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
        </DndProvider>
    );
}

MachineTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            active: PropTypes.bool.isRequired,
            sort: PropTypes.number.isRequired,
            line_id: PropTypes.number,
            line_name: PropTypes.string
        })
    ).isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
};

export default MachineTable;
