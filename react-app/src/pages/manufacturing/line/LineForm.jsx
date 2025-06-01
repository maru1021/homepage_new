import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField, Stack } from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function LineForm({ closeModal }) {
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [position_x, setPositionX] = useState(0);
    const [position_y, setPositionY] = useState(0);

    const inputValid = () => {
        const validationRules = [
            {value: name, errorField: setNameError, type: "required", errorMessage: "ライン名を入力して下さい" }
        ]
        return validateFields(validationRules);
    };

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValid()) return;

        const sendData = {
            name,
            position_x,
            position_y
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/manufacturing/line`

        handleAPI(url, 'POST', closeModal, sendData, errorFieldMap)
    };

    return (
        <>
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
                        value={position_x}
                        onChange={(e) => setPositionX(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        label='位置Y'
                        value={position_y}
                        onChange={(e) => setPositionY(e.target.value)}
                    />
                </Stack>

                <DialogActions>
                    <Button type='submit' variant='contained' color='primary' onClick={handleSubmit}>
                        登録
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

LineForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default LineForm;
