import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createCallable } from 'react-call';

const Modal = createCallable(({ call, title, FormComponent, formProps={} }) => {
    const closeModal = () => call.end(null);

    return (
        <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
            <DialogTitle>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={() => call.end(null)}
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
                <FormComponent {...formProps} closeModal={closeModal} />
            </DialogContent>
        </Dialog>
    );
});

Modal.propTypes = {
    title: PropTypes.string.isRequired,
    FormComponent: PropTypes.func.isRequired,
    formProps: PropTypes.object,
}

export default Modal