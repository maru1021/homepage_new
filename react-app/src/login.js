import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Card, CardContent, Typography,
    TextField, Button, Box
} from '@mui/material';
import API_BASE_URL from './baseURL';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError('');
        setPasswordError('');
        setErrorMessage('');

        let isValid = true;

        if (!username) {
            setUsernameError('社員番号を入力してください');
            isValid = false;
        }

        if (!password) {
            setPasswordError('パスワードを入力してください');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error('社員番号もしくはパスワードが間違えています');
            }

            const data = await response.json();
            setToken(data.access_token);
            navigate('/');

        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f6f8',
            }}
        >
            <Container maxWidth='xs'>
                <Card
                    sx={{
                        p: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                    }}
                >
                    <CardContent>
                        <Typography variant='h4' align='center' gutterBottom sx={{ fontWeight: 'bold' }}>
                            ログイン
                        </Typography>

                        {errorMessage && (
                            <Typography
                                color='error'
                                align='center'
                                fontSize='small'
                            >
                                {errorMessage}
                            </Typography>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label='社員番号'
                                margin='normal'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                error={Boolean(usernameError)}
                                helperText={usernameError}
                            />
                            <TextField
                                fullWidth
                                label='パスワード'
                                type='password'
                                margin='normal'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={Boolean(passwordError)}
                                helperText={passwordError}
                            />
                            <Button
                                type='submit'
                                fullWidth
                                color='primary'
                                sx={{
                                    mt: 3,
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: '#1565c0',
                                    },
                                }}
                            >
                                ログイン
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};

export default Login;
