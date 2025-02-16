import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextField } from '@mui/material';
import { ja } from 'date-fns/locale';
import '../../CSS/datepicker.css'

const DateField = ({ selectedDate, setDate, label, error, helperText }) => {
    return (
        <DatePicker
            selected={selectedDate}
            onChange={(date) => setDate(date)}
            dateFormat="yyyy/MM/dd"
            locale={ja}
            popperPlacement="bottom-start"
            className="custom-datepicker" // ✅ カスタムクラスを適用
            customInput={
                <TextField
                    fullWidth
                    label={label}
                    variant="outlined"
                    error={Boolean(error)}
                    helperText={helperText}
                />
            }
        />
    );
};

DateField.propTypes = {
    selectedDate: PropTypes.instanceOf(Date),
    setDate: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
};

export default DateField;
