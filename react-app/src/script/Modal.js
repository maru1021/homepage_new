import React from 'react';
import PropTypes from 'prop-types';

function Modal({ show, onClose, onRegister, title, FormComponent }) {
    return (
        <>
            {show && <div className="modal-overlay" onClick={onClose}></div>}
            <div
                className={`modal ${show ? 'd-block' : 'd-none'}`} 
                tabIndex="-1"
                onClick={onClose}
            >
                <div
                    className="modal-dialog"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <FormComponent onRegister={onRegister} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Modal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRegister: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    FormComponent: PropTypes.elementType.isRequired, // FormComponentの型を明示
};

export default Modal;
