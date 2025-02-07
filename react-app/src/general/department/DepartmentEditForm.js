import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { successNoti, errorNoti } from '../../script/noti';
import API_BASE_URL from '../../baseURL';

function DepartmentEditForm({ department, onSave }) {
    const [name, setName] = useState(department?.name || '');

    const [nameError, setNameError] = useState('');

    const inputValid = () => {
        let isValid = true;

        if (!name) {
            setNameError('部署名を入力してください。');
            isValid = false;
        }
        return isValid;
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        setNameError('');

        if (!inputValid()) return;

        const send_data = {
            name,
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/departments/${department?.id || ''}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(send_data),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            successNoti(data.message);
            onSave(send_data); // 保存後に親コンポーネントへ通知
        } else {
            if (data.field === 'name') {
                setNameError(data.message);
            } else {
                errorNoti('登録に失敗しました。');
            }
        }
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
    department: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
    }),
    onSave: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number
};

export default DepartmentEditForm;
