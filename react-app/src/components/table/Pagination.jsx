import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, Stack } from '@mui/material';


const PaginationComponent = ({ totalPages, currentPage, onPageChange }) => {
    return (
        <Stack spacing={2} alignItems="flex-end" sx={{ marginTop: 2 }}>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => onPageChange(page)}
                color="primary"
                shape="rounded"
                sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '3px 3px 10px rgba(200, 200, 200, 0.5), -3px -3px 10px rgba(255, 255, 255, 0.8)',
                    '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                        transition: 'all 0.3s ease-in-out',
                        background: 'rgba(245, 245, 245, 0.9)',
                        boxShadow: 'inset 2px 2px 6px rgba(200, 200, 200, 0.3), inset -2px -2px 6px rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                            background: 'rgba(235, 235, 255, 0.8)',
                            transform: 'scale(1.05)',
                        },
                        '&.Mui-selected': {
                            background: 'linear-gradient(to right, #7aa8ff, #6b9ef3)',
                            color: 'white',
                            fontWeight: 'bold',
                            boxShadow: '0px 4px 8px rgba(120, 120, 255, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(to right, #689af2, #5085f0)',
                                transform: 'scale(1.05)',
                            },
                        },
                    },
                }}
            />
        </Stack>
    );
};

PaginationComponent.propTypes = {
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default PaginationComponent;
