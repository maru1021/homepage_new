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

const TableActions = ({
    itemsPerPage,
    onItemsPerPageChange,
    searchQuery,
    onSearchChange,
    onOpenRegisterModal,
    modalClosed
}) => {
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

            <Grid item xs container justifyContent='flex-end' spacing={2} sx={{ marginRight:'8%' }}>
                <Grid item>
                    <TextField
                        value={searchQuery}
                        placeholder='検索'
                        onChange={(e) => onSearchChange(e.target.value)}
                        variant='outlined'
                        size='small'
                        sx={{ width: 200 }}
                        inputRef={searchInputRef}
                    />
                </Grid>
                <Grid item>
                    <Button variant='contained' color='primary' onClick={onOpenRegisterModal}>
                        登録
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};

TableActions.propTypes = {
    itemsPerPage: PropTypes.number.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onOpenRegisterModal: PropTypes.func,
    modalClosed: PropTypes.bool.isRequired,
};

export default TableActions;
