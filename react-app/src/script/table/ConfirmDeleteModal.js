import React from 'react';
import PropTypes from 'prop-types';

const ConfirmDeleteModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">削除確認</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            キャンセル
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>
                            削除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ConfirmDeleteModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
};

export default ConfirmDeleteModal;
