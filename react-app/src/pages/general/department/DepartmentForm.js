import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField } from '@mui/material';

import API_BASE_URL from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function DepartmentForm({ closeModal }) {
    console.log(closeModal)
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');

    const inputValid = () => {
        const validationRules = [
            {value: name, errorField: setNameError, type: "required", errorMessage: "部署を入力して下さい" }
        ]
        return validateFields(validationRules);
    };

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValid()) return;

        const sendData = {
            name,
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/general/department/`

        handleAPI(url, 'POST', closeModal, sendData, errorFieldMap)
    };

    return (
        <>
            <form>
                <TextField
                    fullWidth
                    label='部署名'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    autoFocus
                />
                <DialogActions>
                    <Button type='submit' variant='contained' color='primary' onClick={handleSubmit}>
                        登録
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

DepartmentForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default DepartmentForm;
