import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Button,
    Grid,
} from '@mui/material';


function TableActions ({
    itemsPerPage,
    onItemsPerPageChange,
    searchQuery,
    onSearchChange,
    onOpenRegisterModal,
    modalClosed
}) {
    const searchInputRef = useRef(null);

    // モーダルが閉じられたら検索ボックスにフォーカスを設定
    useEffect(() => {
        if (modalClosed && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [modalClosed]);

    return (
        <Grid
            container
            alignItems='center'
            spacing={2}
            sx={{ mb: 2 }}
        >
            <Grid item sx={{ marginLeft:'17%' }}>
                <FormControl sx={{ minWidth: 90 }} size='small'> {/* 横幅を狭く */}
                    <InputLabel>件数</InputLabel>
                    <Select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        label='件数'
                    >
                        <MenuItem value={5}>5件</MenuItem>
                        <MenuItem value={10}>10件</MenuItem>
                        <MenuItem value={20}>20件</MenuItem>
                        <MenuItem value={50}>50件</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid
                item
                xs
                container
                justifyContent="flex-end"
                spacing={2}
                sx={{ marginRight: '8%' }}
            >
                <Grid item>
                    <TextField
                        value={searchQuery}
                        placeholder="検索"
                        onChange={(e) => onSearchChange(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            width: 220,
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '8px',
                            boxShadow: '2px 2px 6px rgba(200, 200, 200, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.8)',
                        }}
                        inputRef={searchInputRef}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        onClick={onOpenRegisterModal}
                        sx={{
                            background: 'linear-gradient(to right, #8dbaf2, #6b9ef3)',
                            borderRadius: '12px',
                            boxShadow: '4px 4px 10px rgba(180, 200, 255, 0.4)',
                            padding: '8px 20px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                background: 'linear-gradient(to right, #79a5f0, #4d8ef0)',
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        登録
                    </Button>
                </Grid>
            </Grid>

        </Grid>
    );
}

TableActions.propTypes = {
    itemsPerPage: PropTypes.number.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onOpenRegisterModal: PropTypes.func,
    modalClosed: PropTypes.bool.isRequired,
};

export default TableActions;
