import React from "react";
import PropTypes from "prop-types";
import { Pagination, Stack } from "@mui/material";

const PaginationComponent = ({ totalPages, currentPage, onPageChange }) => {
    return (
        <Stack spacing={2} alignItems="flex-end" sx={{ marginTop: 2 }}>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => onPageChange(page)}
                color="primary"
                shape="rounded"
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
