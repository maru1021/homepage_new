import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, Stack, DialogActions
} from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function TypeEditForm({ editData, closeModal }) {
    const [name, setName] = useState(editData?.name || '');

    // エラーメッセージ
    const [nameError, setNameError] = useState('');

    // 入力チェック
    const validateInput = () => {
        const validationRules = [
            { value: name, errorField: setNameError, type: "required", errorMessage: "項目名を入力して下さい"},
        ]

        return validateFields(validationRules);
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInput()) return;

        const sendData = {
            name,
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/homepage/type/${editData?.id}`

        handleAPI(url, 'PUT', closeModal, sendData, errorFieldMap)
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField fullWidth label='項目名'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    autoFocus
                />

                <DialogActions>
                    <Button type='submit'
                        variant='contained'
                        fullWidth
                        sx={{ background: 'linear-gradient(to right, #8dbaf2, #6b9ef3)',
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
                </DialogActions>
            </Stack>
        </form>
    );
}


TypeEditForm.propTypes = {
    editData: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
    }),
    closeModal: PropTypes.func.isRequired,
};

export default TypeEditForm;
