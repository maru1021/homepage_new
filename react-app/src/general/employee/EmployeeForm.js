import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, FormControl, Stack, DialogActions, MenuItem, Select, InputLabel
} from '@mui/material';
import 'react-datepicker/dist/react-datepicker.css';

import API_BASE_URL from '../../baseURL';
import { successNoti, errorNoti } from '../../script/noti';
import DateField from '../../script/form/date';


function EmployeeForm({ onRegister }) {
    const [employee_no, setEmployeeNo] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [hireDate, setHireDate] = useState(null);
    const [employment_type, setEmploymentType] = useState('');
    const [contract_expiration, setContractExpiration] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // エラーメッセージ
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');

    // 入力チェック
    const validateInput = () => {
        let isValid = true;
        setEmployeeNoError('');
        setNameError('');
        setEmailError('');

        if (!employee_no.match(/^[a-zA-Z0-9]{7}$/)) {
            setEmployeeNoError('社員番号は7桁の英数字で入力してください。');
            isValid = false;
        }
        if (!name) {
            setNameError('名前を入力してください。');
            isValid = false;
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setEmailError('正しいメールアドレスを入力してください。');
            isValid = false;
        }
        return isValid;
    };

    // 登録処理
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateInput()) return;

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/general/employee/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                employee_no,
                name,
                email,
                phone_number,
                gender,
                address,
                birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
                hire_date: hireDate ? hireDate.toISOString().split('T')[0] : null,
                employment_type,
                contract_expiration: employment_type === '派遣社員' || employment_type === '業務委託' ? 
                    (contract_expiration ? contract_expiration.toISOString().split('T')[0] : null) 
                    : null,
                department_id: selectedDepartment,
            }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
            setEmployeeNo('');
            setName('');
            setEmail('');
            setPhoneNumber('');
            setGender('');
            setAddress('');
            setBirthDate(null);
            setHireDate(null);
            setEmploymentType('');
            setContractExpiration(null);
            setSelectedDepartment('');
            onRegister();
            successNoti('登録成功しました！');
        } else {
            errorNoti(data.message || '登録に失敗しました。');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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

                <TextField fullWidth label='名前'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                />

                <TextField
                    fullWidth
                    label='メールアドレス'
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(emailError)}
                    helperText={emailError} 
                />

                <TextField
                    fullWidth
                    label='電話番号'
                    value={phone_number}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <TextField
                    fullWidth
                    label='住所'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <FormControl fullWidth>
                    <InputLabel>性別</InputLabel>
                    <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <MenuItem value='男性'>男性</MenuItem>
                        <MenuItem value='女性'>女性</MenuItem>
                        <MenuItem value='その他'>その他</MenuItem>
                    </Select>
                </FormControl>

                <DateField
                    selectedDate={birthDate}
                    setDate={setBirthDate}
                    label="生年月日"
                />

                <DateField
                    selectedDate={hireDate}
                    setDate={setHireDate}
                    label="入社日"
                />

                <FormControl fullWidth>
                    <InputLabel>雇用形態</InputLabel>
                    <Select value={employment_type} onChange={(e) => setEmploymentType(e.target.value)}>
                        <MenuItem value='正社員'>正社員</MenuItem>
                        <MenuItem value='派遣社員'>派遣社員</MenuItem>
                        <MenuItem value='業務委託'>業務委託</MenuItem>
                        <MenuItem value='アルバイト'>アルバイト</MenuItem>
                    </Select>
                </FormControl>

                {(employment_type === '派遣社員' || employment_type === '業務委託') && (
                    <DateField
                        selectedDate={contract_expiration}
                        setDate={setContractExpiration}
                        label="契約満了日"
                    />
                )}

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

EmployeeForm.propTypes = { onRegister: PropTypes.func.isRequired };

export default EmployeeForm;
