import React from 'react';
import PropTypes from 'prop-types';
import EmployeeForm from './EmployeeForm';

function EmployeeModal({ show, onClose, onRegister }) {
    return (
        <>
            {show && <div className="modal-overlay" onClick={onClose}></div>}
            <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">従業員登録</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <EmployeeForm onRegister={onRegister} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EmployeeModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRegister: PropTypes.func.isRequired,
};

export default EmployeeModal;
