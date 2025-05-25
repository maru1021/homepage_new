import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Error as ErrorIcon } from '@mui/icons-material';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                textAlign: 'center',
                padding: 3,
                background: 'linear-gradient(135deg, rgba(240,240,240,0.4) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: '15px',
                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
                margin: 3
            }}
        >
            <ErrorIcon
                sx={{
                    fontSize: '100px',
                    color: '#ff6b6b',
                    marginBottom: 3,
                    filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.2))'
                }}
            />

            <Typography
                variant="h1"
                sx={{
                    fontSize: { xs: '4rem', sm: '6rem' },
                    fontWeight: 'bold',
                    color: '#444',
                    marginBottom: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                404
            </Typography>

            <Typography
                variant="h4"
                sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: '#666',
                    marginBottom: 4
                }}
            >
                ページが見つかりませんでした
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    color: '#888',
                    marginBottom: 4,
                    maxWidth: '600px'
                }}
            >
                お探しのページは削除されたか、URLが間違っている可能性があります。
            </Typography>

            <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    borderRadius: '25px',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    color: 'white',
                    padding: '10px 30px',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px 2px rgba(33, 203, 243, .4)',
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                ホームに戻る
            </Button>
        </Box>
    );
};

export default NotFound;
