import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, FormControl, FormHelperText,
     Stack, DialogActions
} from '@mui/material';
import Select from 'react-select';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import API_BASE_URL from '../../../config/baseURL';
import handleRegister from '../../../utils/handleAPI';
import validateFields from '../../../utils/validFields';


// 部署データを取得する関数
const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/general/department`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.ok) {
        const data = await response.json();
        return data.departments || [];
    } else {
        console.error('Failed to fetch departments');
        return [];
    }
};

function EmployeeAuthorityForm({ onSuccess }) {
    const [employee_no, setEmployeeNo] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // 部署リスト
    const [departments, setDepartments] = useState([]);

    // 各インプットのエラーメッセージ用の状態
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // 部署と権限のフォームの状態
    const [forms, setForms] = useState([
        { department: '', admin: false },
    ]);

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
        setForms([...forms, { department: '', admin: 'false' }]);
    };

    // 部署と権限フォームの削除
    const handleRemoveForm = (index) => {
        const updatedForms = forms.filter((_, i) => i !== index);
        setForms(updatedForms);
    };

    // 部署と権限フォームのデータ変更
    const handleFormChange = (index, field, value) => {
        const updatedForms = [...forms];
        updatedForms[index][field] = value;
        setForms(updatedForms);
    };

    // 入力フォームのバリデーション
    const inputValid = () => {
        const validationRules = [
            { value: employee_no, errorField: setEmployeeNoError, type: "employeeNo" },
            { value: name, errorField: setNameError, type: "required", errorMessage: "名前を入力してください" },
            { value: email, errorField: setEmailError, type: "email"},
            { value: forms, errorField: setFormErrors, type: "list", errorMessage: "部署を選択して下さい" },
        ];

        return validateFields(validationRules);
    };

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!inputValid()) return;

        const errorFieldMap = {
            employee_no: setEmployeeNoError,
            name: setNameError,
            email: setEmailError,
        };

        // selectの形式を戻さないとサーバーサイドで弾かれる
        const formattedForms = forms.map(form => ({
            department: form.department.value,
            admin: form.admin
        }));

        const sendData = {
            name,
            employee_no,
            email,
            forms: formattedForms
        }

        const url = `${API_BASE_URL}/api/authority/employee_authority/`

        handleRegister(url, "POST", onSuccess, sendData, errorFieldMap)
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
                <TextField
                    fullWidth
                    label='メールアドレス'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(emailError)}
                    helperText={emailError}
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
                            <Select
                                options={departments.map(department => ({
                                    value: department.id,
                                    label: department.name
                                }))}
                                value={form.department}
                                onChange={(selectedOption) => handleFormChange(index, "department", selectedOption)}
                                isSearchable={true}
                                placeholder="部署を選択"
                            />
                            {formErrors[index] && <FormHelperText>{formErrors[index]}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth>
                            <Select
                                options={[
                                    { value: false, label: '利用者' },
                                    { value: true, label: '管理者' }
                                ]}
                                value={{ value: form.admin ?? false, label: form.admin ? '管理者' : '利用者' }}
                                onChange={(selectedOption) => handleFormChange(index, "admin", selectedOption.value)}
                                isSearchable={false} // 検索を無効化
                                placeholder="権限を選択"
                            />
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
                        登録
                    </Button>
                </DialogActions>
            </Stack>
        </form>
    );
}

EmployeeAuthorityForm.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};

export default EmployeeAuthorityForm;
