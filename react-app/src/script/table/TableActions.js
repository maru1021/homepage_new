import React from 'react';
import PropTypes from 'prop-types';

const TableActions = ({
    itemsPerPage,
    onItemsPerPageChange,
    searchQuery,
    onSearchChange,
    onOpenRegisterModal,
}) => {
    return (
        <div className="d-flex justify-content-between align-items-center mb-2 table-container">
            <div>
                <label>表示件数:</label>
                <select
                    value={itemsPerPage}
                    className="form-select d-inline w-auto ms-2"
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                >
                    <option value={5}>5件</option>
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={50}>50件</option>
                </select>
            </div>
            <div className="button-container">
                <input
                    type="text"
                    value={searchQuery}
                    placeholder="検索"
                    className="form-control me-2 d-inline w-auto"
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <button className="btn btn-primary" onClick={onOpenRegisterModal}>
                    登録
                </button>
            </div>
        </div>
    );
}

TableActions.propTypes = {
    itemsPerPage: PropTypes.number.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onOpenRegisterModal: PropTypes.func,
};

export default TableActions;
