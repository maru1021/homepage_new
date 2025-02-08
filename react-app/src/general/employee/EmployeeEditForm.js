import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
    Button, TextField, Select, MenuItem, FormControl,
    InputLabel, FormHelperText, Stack, DialogActions
} from '@mui/material';

import API_BASE_URL from '../../baseURL';
import { successNoti, errorNoti } from '../../script/noti';
import employeeValid from '../../script/valid/employeeValid';

// 部署データを取得する関数
const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
        const data = await response.json();
        return data.departments || [];
    } else {
        console.error('Failed to fetch departments');
        return [];
    }
};

function EmployeeEditForm({ employee, onSave }) {
    const [employee_no, setEmployeeNo] = useState(employee?.employee_no || '');
    const [name, setName] = useState(employee?.name || '');
    const [departments, setDepartments] = useState([]);
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // 部署と権限のフォームの状態
    const [forms, setForms] = useState(
        employee?.departments?.map((dep) => ({
            department: dep.id, 
            admin: dep.admin ?? false,
        })) || [{ department: '', admin: false }]
    );

    // 部署データを取得
    useEffect(() => {
        const loadDepartments = async () => {
            const data = await fetchDepartments();
            setDepartments(data);
        };
        loadDepartments();
    }, []);

    // 部署と権限フォームの追加
    const handleAddForm = () => {
        setForms([...forms, { department: '', admin: false }]);
    };

    // 部署と権限フォームの削除
    const handleRemoveForm = (index) => {
        setForms(forms.filter((_, i) => i !== index));
    };

    // 部署と権限フォームのデータ変更
    const handleFormChange = (index, field, value) => {
        const updatedForms = [...forms];
        updatedForms[index] = { ...updatedForms[index], [field]: value };
        setForms(updatedForms);
    };

    // 入力フォームのバリデーション
    const inputValid = () => {
        let isValid = true;
        const errors = [];

        if (!employee_no) {
            setEmployeeNoError('社員番号を入力してください。');
            isValid = false;
        } else if (!employeeValid(employee_no)) {
            setEmployeeNoError('社員番号は7桁の英数字で入力してください。');
            isValid = false;
        }

        if (!name) {
            setNameError('名前を入力してください。');
            isValid = false;
        }

        forms.forEach((form, index) => {
            if (!form.department) {
                errors[index] = '部署を選択してください。';
                isValid = false;
            }
        });

        setFormErrors(errors);
        return isValid;
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();
        setEmployeeNoError('');
        setNameError('');
        setFormErrors([]);

        if (!inputValid()) return;

        const send_data = {
            name,
            employee_no,
            forms: forms.map((form) => ({
                department: form.department,
                admin: Boolean(form.admin),
            })),
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/employees/${employee?.id || ''}`, {
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
            onSave(send_data);
        } else {
            if (data.field === 'employee_no') {
                setEmployeeNoError(data.message);
            } else {
                errorNoti('登録に失敗しました。');
            }
        }
    };

    return (
        <form>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label='社員番号'
                    value={employee_no}
                    onChange={(e) => setEmployeeNo(e.target.value)}
                    error={Boolean(employeeNoError)}
                    helperText={employeeNoError}
                    autoFocus
                />

                <TextField
                    fullWidth
                    label='名前'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                />

                <hr />

                {forms.map((form, index) => (
                    <Stack key={index} spacing={2} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 1 }}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <h6>部署と権限 {index + 1}</h6>
                            {index > 0 && (
                                <Button
                                    variant='contained'
                                    size='small'
                                    startIcon={<RemoveIcon />}
                                    color='error'
                                    onClick={() => handleRemoveForm(index)}
                                >
                                    削除
                                </Button>
                            )}
                        </Stack>

                        <FormControl fullWidth error={Boolean(formErrors[index])}>
                            <InputLabel>部署</InputLabel>
                            <Select
                                value={departments.some(d => d.id === form.department) ? form.department : ''}
                                onChange={(e) => handleFormChange(index, 'department', e.target.value)}
                            >
                                {departments.map((department) => (
                                    <MenuItem key={department.id} value={department.id}>
                                        {department.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors[index] && <FormHelperText>{formErrors[index]}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>権限</InputLabel>
                            <Select
                                value={form.admin ? 'true' : 'false'}
                                onChange={(e) => handleFormChange(index, 'admin', e.target.value === 'true')}
                            >
                                <MenuItem value='false'>利用者</MenuItem>
                                <MenuItem value='true'>管理者</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                ))}

                <Stack direction='row' justifyContent='flex-start'>
                    <Button
                        variant='contained'
                        size='small'
                        startIcon={<AddIcon />}
                        color='success'
                        onClick={handleAddForm}
                    >
                        追加
                    </Button>
                </Stack>

                <DialogActions>
                    <Button type='submit' variant='contained' color='primary' onClick={handleSubmit}>
                        保存
                    </Button>
                </DialogActions>
            </Stack>
        </form>
    );
}


EmployeeEditForm.propTypes = {
    employee: PropTypes.shape({
        id: PropTypes.number,
        employee_no: PropTypes.string,
        name: PropTypes.string,
        departments: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string,
                admin: PropTypes.bool,
            })
        ),
    }),
    onSave: PropTypes.func.isRequired,
};

export default EmployeeEditForm;
