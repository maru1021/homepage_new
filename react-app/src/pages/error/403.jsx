import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GppBad as GppBadIcon } from '@mui/icons-material';

const Forbidden = () => {
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
            <GppBadIcon
                sx={{
                    fontSize: '100px',
                    color: '#ff9800',
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
                403
            </Typography>

            <Typography
                variant="h4"
                sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: '#666',
                    marginBottom: 4
                }}
            >
                アクセス権限がありません
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    color: '#888',
                    marginBottom: 4,
                    maxWidth: '600px'
                }}
            >
                このページにアクセスする権限がありません。必要に応じて管理者にお問い合わせください。
            </Typography>

            <Button
                variant="contained"
                onClick={() => navigate('/all/bulletin_board/list')}
                sx={{
                    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                    borderRadius: '25px',
                    boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                    color: 'white',
                    padding: '10px 30px',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #F57C00 30%, #FFA726 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px 2px rgba(255, 152, 0, .4)',
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                ホームに戻る
            </Button>
        </Box>
    );
};

export default Forbidden;