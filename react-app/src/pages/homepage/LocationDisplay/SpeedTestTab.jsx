import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Grid, LinearProgress, Paper, Stack,
  Typography, Fade, Container
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const SpeedTestTab = ({ hidden, active }) => {
  // 現在の測定値の状態
  const [currentStats, setCurrentStats] = useState({
    download: 0,
    upload: 0,
    ping: 0
  });

  // 表示用のアニメーション値（よりスムーズに変化）
  const [displayStats, setDisplayStats] = useState({
    download: 0,
    upload: 0,
    ping: 0
  });

  // 測定中かどうかのステート
  const [measuring, setMeasuring] = useState(false);

  // 測定に関連するインターバルとタイマーの参照
  const animationFrameRef = useRef(null);
  const pingTimerRef = useRef(null);
  const downloadTimerRef = useRef(null);
  const uploadTimerRef = useRef(null);

  // タブがアクティブになったとき測定を開始
  useEffect(() => {
    if (active && !hidden) {
      startContinuousMeasurement();
    } else {
      stopContinuousMeasurement();
    }

    return () => {
      stopContinuousMeasurement();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [active, hidden]);

  // 値が変化したときに表示をスムーズに更新する
  useEffect(() => {
    // 表示値をスムーズに目標値に近づける関数
    const updateDisplayValues = () => {
      setDisplayStats(prev => {
        const newDownload = smoothValue(prev.download, currentStats.download);
        const newUpload = smoothValue(prev.upload, currentStats.upload);
        const newPing = smoothValue(prev.ping, currentStats.ping);

        // 次のフレームをスケジュール
        if (
          Math.abs(newDownload - currentStats.download) > 0.01 ||
          Math.abs(newUpload - currentStats.upload) > 0.01 ||
          Math.abs(newPing - currentStats.ping) > 0.01
        ) {
          animationFrameRef.current = requestAnimationFrame(updateDisplayValues);
        }

        return {
          download: newDownload,
          upload: newUpload,
          ping: newPing
        };
      });
    };

    // 初回のアニメーションフレームを開始
    animationFrameRef.current = requestAnimationFrame(updateDisplayValues);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentStats]);

  // 値をスムーズに変化させるヘルパー関数
  const smoothValue = (current, target) => {
    const factor = 0.1; // 変化の速さ (0.1 = 10%ずつ近づく)
    return current + (target - current) * factor;
  };

  // 連続測定を開始
  const startContinuousMeasurement = () => {
    setMeasuring(true);

    // すべての測定をクリア
    clearAllMeasurements();

    // Ping測定を開始（3秒ごと）
    measurePing();
    pingTimerRef.current = setInterval(measurePing, 3000);

    // ダウンロード測定を開始（10秒ごと）
    setTimeout(() => {
      measureDownload();
      downloadTimerRef.current = setInterval(measureDownload, 10000);
    }, 500);

    // アップロード測定を開始（12秒ごと）
    setTimeout(() => {
      measureUpload();
      uploadTimerRef.current = setInterval(measureUpload, 12000);
    }, 1000);
  };

  // 連続測定を停止
  const stopContinuousMeasurement = () => {
    setMeasuring(false);
    clearAllMeasurements();
  };

  // すべての測定タイマーをクリア
  const clearAllMeasurements = () => {
    clearInterval(pingTimerRef.current);
    clearInterval(downloadTimerRef.current);
    clearInterval(uploadTimerRef.current);
  };

  // Ping測定
  const measurePing = async () => {
    const pingAttempts = 3;
    let totalPing = 0;
    let successfulPings = 0;

    for (let i = 0; i < pingAttempts; i++) {
      const startTime = performance.now();
      try {
        // 軽量なエンドポイントへのリクエスト
        await fetch('https://www.google.com', {
          cache: 'no-store',
          mode: 'no-cors'
        });

        const endTime = performance.now();
        const pingTime = Math.round(endTime - startTime);

        if (pingTime > 0) {
          totalPing += pingTime;
          successfulPings++;
        }
      } catch (error) {
        console.error("Ping measurement failed:", error);
      }
    }

    // 実際のPing値を計算
    const newPing = successfulPings > 0
      ? Math.round(totalPing / successfulPings)
      : 50;

    // 状態を更新（ランダム変動なし）
    setCurrentStats(prev => ({
      ...prev,
      ping: newPing
    }));
  };

  // ダウンロード速度測定
  const measureDownload = async () => {
    try {
      // より大きなファイルをダウンロードして正確に測定
      const fileSize = 2 * 1024 * 1024; // 2MB
      const cacheBuster = `?cache=${Math.random()}`;
      const startTime = performance.now();

      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${fileSize}${cacheBuster}`);
      await response.blob();

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // 秒単位

      // Mbpsに変換（実際の計測値）
      let speedMbps = ((fileSize * 8) / duration) / (1024 * 1024);

      // 無効な値の場合はフォールバック
      const finalSpeed = isNaN(speedMbps) || speedMbps <= 0
        ? 10.0 // フォールバック値
        : speedMbps;

      // 状態を更新（ランダム要素なし）
      setCurrentStats(prev => ({
        ...prev,
        download: parseFloat(finalSpeed.toFixed(1))
      }));
    } catch (error) {
      console.error("Download test failed:", error);
      // エラー時は前回の値を維持
      setCurrentStats(prev => ({
        ...prev,
        download: prev.download || 10.0
      }));
    }
  };

  // アップロード速度測定
  const measureUpload = async () => {
    try {
      // より大きなデータをアップロード
      const dataSize = 1 * 1024 * 1024; // 1MB
      const blob = new Blob([new ArrayBuffer(dataSize)]);

      const startTime = performance.now();
      await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: blob,
        cache: 'no-store'
      });

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // 秒単位

      // Mbpsに変換（実際の計測値）
      let speedMbps = ((dataSize * 8) / duration) / (1024 * 1024);

      // 無効な値の場合はフォールバック
      const finalSpeed = isNaN(speedMbps) || speedMbps <= 0
        ? 5.0 // フォールバック値
        : speedMbps;

      // 状態を更新（ランダム要素なし）
      setCurrentStats(prev => ({
        ...prev,
        upload: parseFloat(finalSpeed.toFixed(1))
      }));
    } catch (error) {
      console.error("Upload test failed:", error);
      // エラー時は前回の値を維持
      setCurrentStats(prev => ({
        ...prev,
        upload: prev.upload || 5.0
      }));
    }
  };

  // コンポーネントが非表示の場合は何も表示しない
  if (hidden || !active) return null;

  return (
    <Stack spacing={3}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          リアルタイム通信速度モニター
        </Typography>
      </Box>

      {/* 測定値表示 - 中央に配置するように修正 */}
      <Container maxWidth="md" disableGutters sx={{ mx: 'auto' }}>
        <Grid container spacing={2} justifyContent="center">
          {/* ダウンロード速度 */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ position: 'relative', zIndex: 2 }}>
                {displayStats.download.toFixed(1)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                ダウンロード速度 (Mbps)
              </Typography>

              {/* アクティビティインジケーター */}
              <Fade in={measuring} timeout={500}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3
                  }}
                >
                  <LinearProgress
                    color="primary"
                    sx={{
                      height: '100%',
                      borderRadius: 0,
                      '& .MuiLinearProgress-bar': {
                        animationDuration: '1s'
                      }
                    }}
                  />
                </Box>
              </Fade>
            </Paper>
          </Grid>

          {/* アップロード速度 */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <NetworkCheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ position: 'relative', zIndex: 2 }}>
                {displayStats.upload.toFixed(1)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                アップロード速度 (Mbps)
              </Typography>

              {/* アクティビティインジケーター */}
              <Fade in={measuring} timeout={500}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3
                  }}
                >
                  <LinearProgress
                    color="success"
                    sx={{
                      height: '100%',
                      borderRadius: 0,
                      '& .MuiLinearProgress-bar': {
                        animationDuration: '1.5s'
                      }
                    }}
                  />
                </Box>
              </Fade>
            </Paper>
          </Grid>

          {/* Ping */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <ThermostatIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ position: 'relative', zIndex: 2 }}>
                {Math.round(displayStats.ping)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Ping応答時間 (ms)
              </Typography>

              {/* アクティビティインジケーター */}
              <Fade in={measuring} timeout={500}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3
                  }}
                >
                  <LinearProgress
                    color="warning"
                    sx={{
                      height: '100%',
                      borderRadius: 0,
                      '& .MuiLinearProgress-bar': {
                        animationDuration: '0.8s'
                      }
                    }}
                  />
                </Box>
              </Fade>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Stack>
  );
};

SpeedTestTab.propTypes = {
  hidden: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired
};

export default SpeedTestTab;