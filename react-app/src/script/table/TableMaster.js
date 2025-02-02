import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TableActions from './TableActions';
import Pagination from './Pagination';
import Modal from '../Modal';

const TableMaster = ({ title, fetchData, TableComponent, modalTitle, FormComponent, ExcelOutput=null, Excelinput=null }) => {
    const [tableDatas, setTableDatas] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1); // 現在のページ
    const [totalPages, setTotalPages] = useState(1); // ページの合計
    const [isModalOpen, setIsRegisterModalOpen] = useState(false);

    const openRegisterModal = () => setIsRegisterModalOpen(true);
    const closeRegisterModal = () => setIsRegisterModalOpen(false);

    // テーブルのデータの取得
    const loadData = async (query, page, limit) => {
        const data = await fetchData(query, page, limit);
        setTableDatas(data.tableDatas || []);
        setTotalPages(Math.ceil(data.totalCount / limit));
    };

    // 検索、ページ移動時にloadDataを実行
    useEffect(() => {
        loadData(searchQuery, currentPage, itemsPerPage);
    }, [searchQuery, currentPage, itemsPerPage]);

    // 編集または登録後の処理
    const handleDataUpdate = () => {
        loadData(searchQuery, currentPage, itemsPerPage); // 現在の検索条件で再取得
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
        <div className="TableWithActions">
            <header>
                <div className='row align-items-center'>
                    <h1 className='col-7'>{title}</h1>
                    {ExcelOutput && (
                        <button className='btn btn-primary btn-sm col-1 mx-1' onClick={ExcelOutput}>
                            Excel出力
                        </button>
                    )}

                    {Excelinput && (
                        <button
                            className='btn btn-primary btn-sm col-1 mx-1'
                            onClick={() => Excelinput(loadData)}
                        >
                            Excel入力
                        </button>
                    )}
                </div>
            </header>

            <TableActions
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onOpenRegisterModal={openRegisterModal}
            />

            <div className="table-container">
                <TableComponent data={tableDatas} onSave={handleDataUpdate} />
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeRegisterModal}
                onRegister={handleDataUpdate} // 登録後にデータ更新
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
    Excelinput: PropTypes.func,
    ExcelOutput: PropTypes.func,
};

export default TableMaster;
