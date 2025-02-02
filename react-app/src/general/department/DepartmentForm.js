import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DialogActions, TextField } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { successNoti, errorNoti } from '../../script/noti';

function DepartmentForm({ onRegister }) {
    // 入力フォームの内容
    const [name, setName] = useState('');

    // 各インプットのエラーメッセージ用の状態
    const [nameError, setNameError] = useState('');

    //入力フォームのバリデーション
    const inputValid = () => {
        let isValid = true;
        if (!name) {
            setNameError("部署名を入力してください。");
            isValid = false;
        }
        return isValid;
    };

    // 登録時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        // エラーメッセージの初期化
        setNameError('');

        // バリデーションエラーがあれば送信を中止、メッセージを表示
        if (!inputValid()) return;

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/departments/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // 登録完了メッセージを表示、入力フォームの初期化、モーダルを閉じる
            setName('');
            onRegister();
            successNoti(data.message);
        } else {
            // サーバーからのエラーメッセージをセット
            console.log(data);
            if (data.field === "name") {
                setNameError(data.message);
            } else {
                errorNoti("登録に失敗しました。");
            }
        }
    };

    return (
        <>
            <form>
                <TextField
                    fullWidth
                    label="部署名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(nameError)}
                    helperText={nameError}
                />
                <DialogActions>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                        登録
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

// PropTypesの型定義を追加
DepartmentForm.propTypes = {
    onRegister: PropTypes.func.isRequired,
};

export default DepartmentForm;
