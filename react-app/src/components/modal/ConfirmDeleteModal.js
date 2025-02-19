import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


const ConfirmDeleteModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <Dialog open={show} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle>
                削除確認
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
                <p>{message}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color='secondary' variant='outlined'>
                    キャンセル
                </Button>
                <Button onClick={onConfirm} color='error' variant='contained'>
                    削除
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmDeleteModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
};

export default ConfirmDeleteModal;
