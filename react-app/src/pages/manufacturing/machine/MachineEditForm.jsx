import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, FormControl, Stack, DialogActions, MenuItem, Select, InputLabel,
    FormControlLabel, Checkbox
} from '@mui/material';

import { API_BASE_URL } from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import handleAPI from '../../../utils/handleAPI';

// ラインデータを取得する関数
const fetchLines = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/manufacturing/line`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.lines.data || [];
        } else {
            console.error('Failed to fetch lines');
            return [];
        }
    } catch (error) {
        console.error('Error fetching lines:', error);
        return [];
    }
};

function MachineEditForm({ closeModal, editData }) {
    const [name, setName] = useState(editData.name);
    const [line_id, setLineId] = useState(editData.line?.id || '');
    const [active, setActive] = useState(editData.active);
    const [lines, setLines] = useState([]);

    // エラーメッセージ
    const [nameError, setNameError] = useState('');

    // ラインデータを取得
    useEffect(() => {
        const loadLines = async () => {
            const data = await fetchLines();
            setLines(data);
        };
        loadLines();
    }, []);

    // 入力チェック
    const validateInput = () => {
        const validationRules = [
            { value: name, errorField: setNameError, type: "required", errorMessage: "名前を入力して下さい"},
        ]

        return validateFields(validationRules);
    };

    // 更新処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInput()) return;

        const errorFieldMap = {
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/manufacturing/machine/${editData.id}`

        const sendData = {
            name,
            line_id: line_id || null,
            active
        }

        handleAPI(url, 'PUT', closeModal, sendData, errorFieldMap)
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label='名前'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    autoFocus
                />

                <FormControl fullWidth>
                    <InputLabel>ライン</InputLabel>
                    <Select value={line_id} onChange={(e) => setLineId(e.target.value)}>
                        {lines.map((line) => (
                            <MenuItem key={line.id} value={line.id}>
                                {line.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

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
                        更新
                    </Button>
                </DialogActions>
            </Stack>
        </form>
    );
}

MachineEditForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    editData: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        active: PropTypes.bool.isRequired,
        line: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string
        })
    }).isRequired
};

export default MachineEditForm;
