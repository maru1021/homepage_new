import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Card, CardContent, Typography, TextField, Button, IconButton, InputAdornment, Box, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuthService from '../services/auth';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 入力バリデーション
    if (!username || !password) {
      setErrorMessage('社員番号とパスワードを入力してください');
      return;
    }

    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      // AuthServiceを使用してログイン
      await AuthService.login(username, password);

      // 認証状態を更新
      setAuth(true);

      // ホームページにリダイレクト
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(
        error.message === 'Failed to fetch'
          ? 'サーバーに接続できません。ネットワーク接続を確認してください。'
          : (error.message || '社員番号もしくはパスワードが間違えています')
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #eef2ff, #f8f9ff)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: 4,
            borderRadius: 12,
            background: 'rgba(245, 248, 255, 0.2)',
            boxShadow: '5px 5px 20px rgba(150, 170, 255, 0.3), -5px -5px 20px rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px) brightness(1.1)',
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#445' }}
            >
              ログイン
            </Typography>
            {errorMessage && (
              <Typography
                color="error"
                align="center"
                sx={{ mt: 1, mb: 2, padding: 1, bgcolor: 'rgba(255,0,0,0.05)', borderRadius: 1 }}
              >
                {errorMessage}
              </Typography>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="社員番号"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    boxShadow: 'inset 2px 2px 6px rgba(150, 170, 255, 0.2), inset -2px -2px 6px rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    boxShadow: 'inset 2px 2px 6px rgba(150, 170, 255, 0.2), inset -2px -2px 6px rgba(255, 255, 255, 0.7)',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: '#7aa8ff',
                          '&:hover': { backgroundColor: 'rgba(120, 160, 255, 0.1)' },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                disabled={isLoggingIn}
                sx={{
                  mt: 3,
                  height: '48px',
                  background: 'linear-gradient(to right, #9abff7, #7aa8ff)',
                  boxShadow: '4px 4px 10px rgba(160, 190, 255, 0.4), -4px -4px 10px rgba(255, 255, 255, 0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  transition: '0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(to right, #89aff6, #6a98f5)',
                    transform: 'scale(1.02)',
                  },
                  '&:active': {
                    background: 'linear-gradient(to right, #7aa8ff, #689af2)',
                    boxShadow: '4px 4px 10px rgba(160, 190, 255, 0.3), -4px -4px 10px rgba(255, 255, 255, 0.6)',
                    transform: 'scale(1)',
                  },
                }}
              >
                {isLoggingIn ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'ログイン'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

Login.propTypes = { setAuth: PropTypes.func.isRequired };
export default Login;