import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Button } from '@mui/material';
import { SaveAlt as SaveAltIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import TableActions from './TableActions';
import PaginationComponent from './Pagination';
import Modal from '../modal/Modal';

const TableMaster = ({ title, fetchData, TableComponent, modalTitle, FormComponent, ExcelOutput=null, ExcelInput=null }) => {
    const [tableDatas, setTableDatas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1); // 現在のページ
    const [totalPages, setTotalPages] = useState(1); // ページの合計
    const [isModalOpen, setIsRegisterModalOpen] = useState(false);

    const openRegisterModal = () => setIsRegisterModalOpen(true);
    const closeRegisterModal = () => setIsRegisterModalOpen(false);

    // テーブルのデータの取得
    const loadData = async (searchQuery = '', currentPage = 1, itemsPerPage = 10) => {
        const data = await fetchData(searchQuery, currentPage, itemsPerPage);
        setTableDatas(data.tableDatas || []);
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
    };

    // 検索、ページ移動時にloadDataを実行
    useEffect(() => {
        loadData(searchQuery, currentPage, itemsPerPage);
    }, [searchQuery, currentPage, itemsPerPage]);

    // 編集または登録後の処理
    const handleDataUpdate = () => {
        loadData(searchQuery, currentPage, itemsPerPage);
        closeRegisterModal();
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleSearchChange = (newSearchQuery) => {
        setSearchQuery(newSearchQuery);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='TableWithActions'>
            <header>
                <Grid container alignItems='center' spacing={2} sx={{ paddingY: 2, paddingLeft: '17%' }}>
                    <Grid item xs={7}>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            sx={{
                                color: '#444',
                                textShadow: '2px 2px 6px rgba(150, 150, 150, 0.65)',
                            }}
                        >
                            {title}
                        </Typography>
                    </Grid>


                    {ExcelOutput && (
                        <Grid item xs={2}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveAltIcon />}
                                fullWidth
                                onClick={() => ExcelOutput(searchQuery)}
                                sx={{
                                    background: 'linear-gradient(to right, #8dbaf2, #6b9ef3)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '4px 4px 10px rgba(180, 200, 255, 0.4)',
                                    padding: '8px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #79a5f0, #4d8ef0)',
                                        transform: 'scale(1.02)',
                                    },
                                    '&:active': {
                                        boxShadow: 'inset 2px 2px 6px rgba(100, 100, 255, 0.3), inset -2px -2px 6px rgba(255, 255, 255, 0.6)',
                                        transform: 'scale(1)',
                                    },
                                }}
                            >
                                Excel出力
                            </Button>
                        </Grid>
                    )}

                    {ExcelInput && (
                        <Grid item xs={2}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<UploadFileIcon />}
                                fullWidth
                                onClick={() => ExcelInput(loadData)}
                                sx={{
                                    background: 'linear-gradient(to right, #f3a683, #f89466)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '4px 4px 10px rgba(255, 180, 180, 0.4)',
                                    padding: '8px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #f39569, #f57b40)',
                                        transform: 'scale(1.02)',
                                    },
                                    '&:active': {
                                        boxShadow: 'inset 2px 2px 6px rgba(255, 100, 100, 0.3), inset -2px -2px 6px rgba(255, 255, 255, 0.6)',
                                        transform: 'scale(1)',
                                    },
                                }}
                            >
                                Excel入力
                            </Button>
                        </Grid>
                    )}

                </Grid>
            </header>

            <TableActions
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onOpenRegisterModal={openRegisterModal}
                modalClosed={!isModalOpen}
            />

            <div className='table-container'>
                <TableComponent data={tableDatas}
                    onSave={handleDataUpdate}
                    searchQuery={searchQuery}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                />

                <PaginationComponent
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeRegisterModal}
                onRegister={handleDataUpdate}
                title={modalTitle}
                FormComponent={FormComponent}
            />
        </div>
    );
};

TableMaster.propTypes = {
    title: PropTypes.string.isRequired,
    fetchData: PropTypes.func.isRequired,
    TableComponent: PropTypes.elementType.isRequired,
    modalTitle: PropTypes.string.isRequired,
    FormComponent: PropTypes.elementType.isRequired,
    ExcelInput: PropTypes.func,
    ExcelOutput: PropTypes.func,
};

export default TableMaster;
