import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button, TextField, FormControl, InputLabel, MenuItem, Select,
    Stack, DialogActions
} from '@mui/material';

import API_BASE_URL from '../../../config/baseURL';
import validateFields from '../../../utils/validFields';
import DateField from '../../../components/form/date';
import handleAPI from '../../../utils/handleAPI';


function EmployeeEditForm({ employee, onSuccess }) {
    console.log(employee)
    const [employee_no, setEmployeeNo] = useState(employee?.employee_no || '');
    const [name, setName] = useState(employee?.name || '');
    const [email, setEmail] = useState(employee?.email || '');
    const [phone_number, setPhoneNumber] = useState(employee?.info?.phone_number || '');
    const [gender, setGender] = useState(employee?.info?.gender || '');
    const [address, setAddress] = useState(employee?.info?.address || '');
    const [emergency_contact, setEmergency_contact] = useState(employee?.info?.emergency_contact || '')
    const [birthDate, setBirthDate] = useState(employee?.info?.birth_date ? new Date(employee.info.birth_date) : null);
    const [hireDate, setHireDate] = useState(employee?.info?.hire_date ? new Date(employee.info.hire_date) : null);
    const [leaveDate, setLeaveDate] = useState(employee?.info?.leave_date ? new Date(employee.info.leave_date) : null)
    const [employment_type, setEmploymentType] = useState(employee?.info?.employment_type || '');
    const [contract_expiration, setContractExpiration] = useState(employee?.info?.contract_expiration ? new Date(employee.info.contract_expiration) : null);

    // エラーメッセージ
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phone_numberError, setPhoneNumberError] = useState('');


    // 入力チェック
    const validateInput = () => {
        const validationRules = [
            { value: employee_no, errorField: setEmployeeNoError, type: "employeeNo"},
            { value: name, errorField: setNameError, type: "required", errorMessage: "名前を入力して下さい"},
            { value: email, errorField: setEmailError, type: "email" },
            { value: phone_number, errorField: setPhoneNumberError, type: "phone"}
        ]

        return validateFields(validationRules);
    };

    // 編集時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInput()) return;

        const sendData = {
            employee_no,
            name,
            email,
            phone_number,
            gender,
            address,
            birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
            hire_date: hireDate ? hireDate.toISOString().split('T')[0] : null,
            leave_date: leaveDate ? leaveDate.toISOString().split('T')[0] : null,
            employment_type,
            contract_expiration: employment_type === '派遣社員' || employment_type === '業務委託' ? 
                (contract_expiration ? contract_expiration.toISOString().split('T')[0] : null) 
                : null,
        };

        const errorFieldMap = {
            employee_no: setEmployeeNo,
            name: setNameError,
        }

        const url = `${API_BASE_URL}/api/general/employee/${employee?.id}`

        handleAPI(url, 'PUT', onSuccess, sendData, errorFieldMap)
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
                    error={Boolean(phone_numberError)}
                    helperText={phone_numberError}
                />

                <TextField
                    fullWidth
                    label='住所'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <TextField
                    fullWidth
                    label='緊急連絡先'
                    value={emergency_contact}
                    onChange={(e) => setEmergency_contact(e.target.value)}
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

                <DateField
                    selectedDate={leaveDate}
                    setDate={setLeaveDate}
                    label="退社日"
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


EmployeeEditForm.propTypes = {
    employee: PropTypes.shape({
        id: PropTypes.number,
        employee_no: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        info: PropTypes.shape({
            phone_number: PropTypes.string,
            gender: PropTypes.string,
            emergency_contact: PropTypes.string,
            address: PropTypes.string,
            birth_date: PropTypes.string,
            employment_type: PropTypes.string,
            hire_date: PropTypes.string,
            leave_date: PropTypes.string,
            contract_expiration: PropTypes.string
        })
    }),
    onSuccess: PropTypes.func.isRequired,
};

export default EmployeeEditForm;
