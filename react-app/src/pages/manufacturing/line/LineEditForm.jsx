import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';


function LineEditForm({ editData, closeModal }) {
    const [name, setName] = useState(editData?.name || '');
    const [active, setActive] = useState(editData?.active ?? true);
    const [nameError, setNameError] = useState('');

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
            active
        };

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/manufacturing/line/${editData?.id}`
        console.log(url)

        handleAPI(url, 'PUT', closeModal, sendData, errorFieldMap)
    };

    return (
        <form>
            <TextField
                fullWidth
                label='ライン名'
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(nameError)}
                helperText={nameError}
                autoFocus
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
        active: PropTypes.bool
    }),
    closeModal: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number
};

export default LineEditForm;
