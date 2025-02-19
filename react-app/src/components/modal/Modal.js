import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Modal({ show, onClose, title, FormComponent, onSuccess }) {
    return (
        <Dialog open={show} onClose={onClose} fullWidth maxWidth='sm'>
            <DialogTitle>
                {title}
                <IconButton
                    aria-label='close'
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <FormComponent onSuccess={onSuccess} />
            </DialogContent>
        </Dialog>
    );
}

Modal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    FormComponent: PropTypes.elementType.isRequired,
    onSuccess: PropTypes.func,
};

export default Modal;
