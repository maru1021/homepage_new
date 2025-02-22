import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createCallable } from 'react-call';

const ConfirmDeleteModal = createCallable(({ call, message }) => {
    return (
        <Dialog open fullWidth maxWidth="xs" onClose={() => call.end(false)}>
            <DialogTitle>
                削除確認
                <IconButton
                    aria-label="close"
                    onClick={() => call.end(false)}
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
                <Button onClick={() => call.end(false)} color="secondary" variant="outlined">
                    キャンセル
                </Button>
                <Button onClick={() => call.end(true)} color="error" variant="contained">
                    削除
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default ConfirmDeleteModal