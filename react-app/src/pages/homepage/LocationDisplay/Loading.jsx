import React, { useEffect, useState } from 'react';
import { Box, Typography, keyframes, Paper } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';

// アニメーションの定義
const radar = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const blink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const PopLoadingScreen = () => {
  const [dots, setDots] = useState('');

  // ドットのアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      elevation={4}
      sx={{
        backgroundColor: '#FCFCFF',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 4,
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3
      }}
    >
      {/* 背景のグラデーション円 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, rgba(255,107,107,0) 70%)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-5%',
          right: '-5%',
          width: '35%',
          height: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.2) 0%, rgba(78,205,196,0) 70%)',
          zIndex: 0
        }}
      />

      {/* 中央の波紋エフェクト */}
      <Box
        sx={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          zIndex: 2
        }}
      >
        {/* 波紋のアニメーション */}
        {[...Array(3)].map((_, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '4px solid rgba(25, 118, 210, 0.3)',
              animation: `${radar} 2s infinite`,
              animationDelay: `${index * 0.5}s`
            }}
          />
        ))}

        {/* 中央のWifiアイコン - ネットワークタブと同じアイコン */}
        <Box
          sx={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 20px rgba(25, 118, 210, 0.5)',
            animation: `${blink} 3s infinite`,
            zIndex: 3
          }}
        >
          <WifiIcon
            sx={{
              fontSize: 45,
              color: 'white',
              animation: `${pulse} 2s ease-in-out infinite`
            }}
          />
        </Box>
      </Box>

      {/* ローディングテキスト */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          color: '#1976d2',
          mb: 1,
          textAlign: 'center'
        }}
      >
        情報を取得中{dots}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#757575',
          textAlign: 'center',
          maxWidth: '70%'
        }}
      >
        Loading...
        <br />
      </Typography>
    </Paper>
  );
};

export default PopLoadingScreen;