import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField, FormControlLabel, Checkbox, Stack } from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function LineEditForm({ editData, closeModal }) {
    const [name, setName] = useState(editData?.name || '');
    const [active, setActive] = useState(editData?.active ?? true);
    const [nameError, setNameError] = useState('');
    const [position_x, setPositionX] = useState(editData?.position_x || 0);
    const [position_y, setPositionY] = useState(editData?.position_y || 0);

    const inputValid = () => {
        const validationRules = [
            {value: name, errorField: setNameError, type: "required", errorMessage: "ライン名を入力して下さい" }
        ]
        return validateFields(validationRules);
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValid()) return;

        const sendData = {
            name,
            active,
            position_x,
            position_y
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/manufacturing/line/${editData?.id}`

        handleAPI(url, 'PUT', closeModal, sendData, errorFieldMap)
    };

    return (
        <form>
            <Stack direction="column" spacing={2}>
                <TextField
                    fullWidth
                    label='ライン名'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    autoFocus
                />
                <TextField
                    fullWidth
                    label='位置X'
                    type="number"
                    value={position_x}
                    onChange={(e) => setPositionX(e.target.value)}
                    inputProps={{ min: 0, max: 700 }}
                />
                <TextField
                    fullWidth
                    label='位置Y'
                    type="number"
                    value={position_y}
                    onChange={(e) => setPositionY(e.target.value)}
                    inputProps={{ min: 0, max: 700 }}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="有効"
                />
            </Stack>
            <DialogActions>
                <Button type='submit' variant='contained' color='primary' onClick={handleSubmit}>
                    登録
                </Button>
            </DialogActions>
        </form>
    );
}

LineEditForm.propTypes = {
    editData: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        active: PropTypes.bool,
        position_x: PropTypes.number,
        position_y: PropTypes.number
    }),
    closeModal: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number
};

export default LineEditForm;
