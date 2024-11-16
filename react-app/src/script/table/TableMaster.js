import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TableActions from './TableActions';
import Pagination from './Pagination';
import Modal from '../Modal';

const TableMaster = ({ title, fetchData, TableComponent, modalTitle, FormComponent }) => {
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

    // 登録後の処理
    const handleRegister = () => {
        closeRegisterModal();
        loadData(searchQuery, 1, itemsPerPage);
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
                <h1>{title}</h1>
            </header>

            <TableActions
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onOpenRegisterModal={openRegisterModal}
            />

            <div className="table-container">
              <TableComponent data={tableDatas} />
              <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
              />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeRegisterModal}
                onRegister={handleRegister}
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
};

export default TableMaster;
