import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, FormControl, FormHelperText,
     Stack, DialogActions
} from '@mui/material';
import Select from 'react-select';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import API_BASE_URL from '../../baseURL';
import { successNoti, errorNoti } from '../../script/noti';
import employeeValid from '../../script/valid/employeeValid';


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

function EmployeeAuthorityForm({ onRegister }) {
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
        if (!email) {
            setEmailError('メールアドレスを入力してください。');
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

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        // selectの形式を戻さないとサーバーサイドで弾かれる
        const formattedForms = forms.map(form => ({
            department: form.department.value,
            admin: form.admin
        }));

        // エラーメッセージの初期化
        setEmployeeNoError('');
        setNameError('');
        setEmailError('');
        setFormErrors([]);

        // バリデーションエラーがあれば送信を中止
        if (!inputValid()) return;

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/authority/employee_authority/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                employee_no,
                email,
                forms: formattedForms,
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setEmployeeNo('');
            setName('');
            setEmail('');
            setForms([{ department: '', admin: 'false' }]);
            onRegister();
            successNoti(data.message);
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
    onRegister: PropTypes.func.isRequired,
};

export default EmployeeAuthorityForm;
