import React, { useState } from 'react';
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import { successNoti, errorNoti } from '../../script/noti';
import employeeValid from '../../script/valid/employeeValid';
import passwordValid from '../../script/valid/passwordValid';


function EmployeeForm({ onRegister }) {
    // 入力フォームの内容
    const [employee_no, setEmployeeNo] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('');

    // 各インプットのエラーメッセージ用の状態
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [departmentError, setDepartmentError] = useState('');

    //入力フォームのバリデーション
    const inputValid = () => {
        let isValid = true;
        if (!employee_no) {
            setEmployeeNoError("社員番号を入力してください。");
            isValid = false;
        } else if (!employeeValid(employee_no)) {
            setEmployeeNoError("社員番号は7桁の英数字で入力してください。");
            isValid = false;
        }
        if (!name) {
            setNameError("名前を入力してください。");
            isValid = false;
        }
        if (!password) {
            setPasswordError("パスワードを入力してください。");
            isValid = false;
        } else if (!passwordValid(password)) {
            setPasswordError("パスワードは8〜20桁の英数字、記号で入力してください。");
            isValid = false;
        }
        if (!department) {
            setDepartmentError("部署を入力してください。");
            isValid = false;
        }

        return isValid;
    };

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        // エラーメッセージの初期化
        setEmployeeNoError('');
        setNameError('');
        setPasswordError('');
        setDepartmentError('');

        // バリデーションエラーがあれば送信を中止、メッセージを表示
        if (!inputValid()) return;

        const response = await fetch("http://localhost:8000/api/employees/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, employee_no, password, department })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 登録完了メッセージを表示、入力フォームの初期化、モーダルを閉じる
            setEmployeeNo('');
            setName('');
            setDepartment('');
            setPassword('');
            onRegister();
            successNoti(data.message);
        } else {
            // サーバーからのエラーメッセージをセット
            if (data.field === "employee_no") {
                setEmployeeNoError(data.message);
            } else {
                errorNoti("登録に失敗しました。");
            }
        }
    };

    return (
        <>
            <form>
                <div className="form-group">
                    <label>部署:</label>
                    <input
                        type="text"
                        value={department}
                        placeholder="部署"
                        className={`form-control ${departmentError ? 'is-invalid' : ''}`}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                    {departmentError && <div className="invalid-feedback">{departmentError}</div>}
                </div>
                <div className="form-group">
                    <label>社員番号:</label>
                    <input
                        type="text"
                        value={employee_no}
                        placeholder="社員番号"
                        className={`form-control ${employeeNoError ? 'is-invalid' : ''}`}
                        onChange={(e) => setEmployeeNo(e.target.value)}
                    />
                    {employeeNoError && <div className="invalid-feedback">{employeeNoError}</div>}
                </div>
                <div className="form-group">
                    <label>名前:</label>
                    <input
                        type="text"
                        value={name}
                        placeholder="名前"
                        className={`form-control ${nameError ? 'is-invalid' : ''}`}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && <div className="invalid-feedback">{nameError}</div>}
                </div>
                <div className="form-group">
                    <label>パスワード:</label>
                    <input
                        type="password"
                        value={password}
                        placeholder="パスワード"
                        className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                </div>
                <hr />
                <div className="d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={handleSubmit}>登録</button>
                </div>
            </form>
        </>
    );
}

// PropTypesの型定義を追加
EmployeeForm.propTypes = {
    onRegister: PropTypes.func.isRequired,
};

export default EmployeeForm;
