import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField } from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function DepartmentEditForm({ editData, closeModal }) {
    const [name, setName] = useState(editData?.name || '');

    const [nameError, setNameError] = useState('');

    const inputValid = () => {
        const validationRules = [
            {value: name, errorField: setNameError, type: "required", errorMessage: "部署を入力して下さい" }
        ]
        return validateFields(validationRules);
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValid()) return;

        const sendData = {
            name,
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/general/department/${editData?.id}`

        handleAPI(url, 'PUT', closeModal, sendData, errorFieldMap)
    };

    return (
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
    );
}

DepartmentEditForm.propTypes = {
    editData: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
    }),
    closeModal: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number
};

export default DepartmentEditForm;
