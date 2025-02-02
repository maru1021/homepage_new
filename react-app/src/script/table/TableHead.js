import React from "react";
import PropTypes from "prop-types";
import { TableHead, TableRow, TableCell } from "@mui/material";
import { alpha } from "@mui/material/styles";

function TableHeader({ columns }) {
    return (
        <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.light, 1.0) }}>
                {columns.map((column, index) => (
                    <TableCell
                        key={index}
                        variant="head"
                        sx={{ color: "white", fontWeight: "bold", padding: "12px" }}
                    >
                        {column}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

TableHeader.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string).isRequired, // カラム名を配列で受け取る
};

export default TableHeader;
