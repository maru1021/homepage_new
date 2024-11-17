import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { successNoti, errorNoti } from '../../script/noti';
import employeeValid from '../../script/valid/employeeValid';

// 部署データを取得する関数
const fetchDepartments = async () => {
    const response = await fetch(`http://localhost:8000/api/departments`);
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

    // 部署リスト
    const [departments, setDepartments] = useState([]);

    // 各インプットのエラーメッセージ用の状態
    const [employeeNoError, setEmployeeNoError] = useState('');
    const [nameError, setNameError] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // 部署と権限のフォームの状態
    const [forms, setForms] = useState(
        employee?.departments.map((dep) => ({
            department: dep.id,
            admin: dep.admin.toString(),
        })) || [{ department: '', admin: 'false' }]
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

        // エラーメッセージの初期化
        setEmployeeNoError('');
        setNameError('');
        setFormErrors([]);

        // バリデーションエラーがあれば送信を中止
        if (!inputValid()) return;

        const payload = {
            name,
            employee_no,
            forms: forms.map((form) => ({
                department: form.department,
                admin: form.admin === 'true', // 文字列をbooleanに変換
            })),
        };

        const response = await fetch(`http://localhost:8000/api/employees/${employee?.id || ''}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            successNoti(data.message);
            onSave(payload); // 保存後に親コンポーネントへ通知
        } else {
            if (data.field === 'employee_no') {
                setEmployeeNoError(data.message);
            } else {
                errorNoti('登録に失敗しました。');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <hr />
            {forms.map((form, index) => (
                <div key={index} className="form-group mb-3 border p-3 rounded">
                    <div className="d-flex align-items-center justify-content-between">
                        <h6>部署と権限 {index + 1}</h6>
                        {index > 0 && (
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveForm(index)}
                            >
                                <FaMinus /> 削除
                            </button>
                        )}
                    </div>
                    <div className="form-group">
                        <label>部署:</label>
                        <select
                            value={form.department}
                            className={`form-select ${formErrors[index] ? 'is-invalid' : ''}`}
                            onChange={(e) => handleFormChange(index, 'department', e.target.value)}
                        >
                            <option value="">部署を選択してください</option>
                            {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                        {formErrors[index] && (
                            <div className="invalid-feedback">{formErrors[index]}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>管理者権限:</label>
                        <select
                            value={form.admin}
                            className="form-select"
                            onChange={(e) => handleFormChange(index, 'admin', e.target.value)}
                        >
                            <option value="false">利用者</option>
                            <option value="true">管理者</option>
                        </select>
                    </div>
                </div>
            ))}
            <div className="d-flex justify-content-start">
                <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleAddForm}
                >
                    <FaPlus /> 追加
                </button>
            </div>
            <hr />
            <div className="d-flex justify-content-end">
                <button className="btn btn-primary" type="submit">
                    保存
                </button>
            </div>
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
