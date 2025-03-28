import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    TextField,
    Button,
    Stack,
    DialogActions,
    FormControl,
    FormHelperText,
} from '@mui/material';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';

// 部署データを取得する関数
const fetchTypes = async () => {
    const response = await fetch(`${API_BASE_URL}/api/homepage/type`, {
        credentials: 'include',
    });
    if (response.ok) {
        const data = await response.json();
        return data.types || [];
    } else {
        console.error('Failed to fetch types');
        return [];
    }
};

function ClassificationForm({ closeModal }) {
    const [name, setName] = useState('');
    const [typeId, setTypeId] = useState('');
    const [types, setTypes] = useState([]);

    // エラーメッセージ
    const [nameError, setNameError] = useState('');
    const [typeError, setTypeError] = useState('');

    // 項目データを取得
    useEffect(() => {
        const loadTypes = async () => {
            const data = await fetchTypes();
            setTypes(data);
        };
        loadTypes();
    }, []);

    // Select用のスタイル
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '56px',
            borderColor: typeError ? '#d32f2f' : '#ccc',
            '&:hover': {
                borderColor: typeError ? '#d32f2f' : '#888'
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: '#666',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    // 入力チェック
    const validateInput = () => {
        const validationRules = [
            { value: name, errorField: setNameError, type: "required", errorMessage: "分類名を入力して下さい"},
            { value: typeId, errorField: setTypeError, type: "required", errorMessage: "項目を選択して下さい"},
        ]

        return validateFields(validationRules);
    };

    // 登録処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInput()) return;

        const errorFieldMap = {
            name: setNameError,
            type_id: setTypeError,
        }

        const url = `${API_BASE_URL}/api/homepage/classification`

        const sendData = {
            name,
            type_id: typeId
        }

        handleAPI(url, 'POST', closeModal, sendData, errorFieldMap)
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <FormControl fullWidth error={Boolean(typeError)}>
                    <Select
                        options={types.map(type => ({
                            value: type.id,
                            label: type.name
                        }))}
                        value={types.map(type => ({
                            value: type.id,
                            label: type.name
                        })).find(option => option.value === typeId)}
                        onChange={(selectedOption) => setTypeId(selectedOption ? selectedOption.value : '')}
                        isSearchable={true}
                        isClearable={true}
                        placeholder="項目を選択"
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    {typeError && <FormHelperText>{typeError}</FormHelperText>}
                </FormControl>

                <TextField
                    fullWidth
                    label='分類名'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    autoFocus
                    inputProps={{ maxLength: 32 }}
                />

                <DialogActions>
                    <Button
                        type='submit'
                        variant='contained'
                        fullWidth
                        sx={{
                            background: 'linear-gradient(to right, #8dbaf2, #6b9ef3)',
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

ClassificationForm.propTypes = { closeModal: PropTypes.func };

export default ClassificationForm;
