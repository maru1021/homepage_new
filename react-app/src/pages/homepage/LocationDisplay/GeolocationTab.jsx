import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, CircularProgress, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableRow, Typography
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DEFAULT_CITY, DEFAULT_COUNTRY } from './constants';
import { sendGeolocationToServer } from './api';

const GeolocationTab = ({
  hidden,
  active,
  browserLocation,
  geoLoading,
  geoError,
  API_BASE_URL,
  setGeoLoading,
  setGeoError,
  setBrowserLocation,
  setSelectedCity,
  updateWeatherData,
}) => {
  if (hidden || !active) return null;

  // ブラウザからの位置情報を取得
  const getGeolocation = () => {
    setGeoLoading(true);
    setGeoError(null);

    // ブラウザがGeolocation APIをサポートしていない場合
    if (!navigator.geolocation) {
      setGeoError('お使いのブラウザは位置情報の取得をサポートしていません。');
      setGeoLoading(false);
      return;
    }

    // 位置情報を取得
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 位置情報をサーバーに送信して地名に変換
          const data = await sendGeolocationToServer(
            API_BASE_URL,
            position.coords.latitude,
            position.coords.longitude
          );

          setBrowserLocation(data);
          setGeoLoading(false);

          // 位置情報から都市情報を取得して天気情報を更新
          // まず region (県) を優先し、なければ city を使用
          let locationName = null;

          if (data.region && data.region !== '不明') {
            locationName = data.region;
            console.log(`地域情報を取得: ${locationName}`);
          } else if (data.city && data.city !== '不明') {
            locationName = data.city;
            console.log(`都市情報を取得: ${locationName}`);
          }

          // 位置情報から地名が取得できた場合
          if (locationName) {
            // 選択した都市を更新
            setSelectedCity(locationName);

            // 天気情報を更新（更新は親コンポーネントのuseEffectで自動的に行われる）
            // 明示的に呼び出しておく
            updateWeatherData(locationName, data.country || DEFAULT_COUNTRY);
          } else {
            setSelectedCity(DEFAULT_CITY);
            updateWeatherData(DEFAULT_CITY, DEFAULT_COUNTRY);
          }
        } catch (error) {
          // バックエンドへの送信に失敗した場合でも、座標は表示する
          setBrowserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: '取得できませんでした',
            city: '不明',
            region: '不明',
            country: '不明'
          });
          setGeoError('位置情報の詳細取得に失敗しました：' + error.message);
          setGeoLoading(false);

          // エラー時はデフォルトの都市情報を使用
          setSelectedCity(DEFAULT_CITY);
          updateWeatherData(DEFAULT_CITY, DEFAULT_COUNTRY);
        }
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';

        // エラーコードに基づいたメッセージ
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の利用が許可されていません。ブラウザの設定から位置情報の利用を許可してください。';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '現在、位置情報が利用できません。';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。';
            break;
          default:
            errorMessage += `: ${error.message}`;
        }

        setGeoError(errorMessage);
        setGeoLoading(false);

        // エラー時はデフォルトの都市情報を使用
        setSelectedCity(DEFAULT_CITY);
        updateWeatherData(DEFAULT_CITY, DEFAULT_COUNTRY);
      },
      {
        enableHighAccuracy: true,  // より高精度な位置情報
        timeout: 10000,            // 10秒でタイムアウト
        maximumAge: 0              // キャッシュした位置情報は使用しない
      }
    );
  };

  return (
    <Stack spacing={2}>
      {/* 位置情報取得前の表示 */}
      {!browserLocation && !geoLoading && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<LocationOnIcon />}
            onClick={getGeolocation}
          >
            現在地の位置情報を取得
          </Button>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            ブラウザの位置情報機能を使用して、現在地を取得します。<br />
            位置情報の使用許可を求められた場合は「許可」をクリックしてください。
          </Typography>
        </Box>
      )}

      {/* 位置情報取得中の表示 */}
      {geoLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            位置情報を取得中...
          </Typography>
        </Box>
      )}

      {/* 位置情報取得後の表示 */}
      {browserLocation && !geoLoading && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            取得した位置情報
          </Typography>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                    緯度
                  </TableCell>
                  <TableCell>{browserLocation.latitude}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    経度
                  </TableCell>
                  <TableCell>{browserLocation.longitude}</TableCell>
                </TableRow>
                {browserLocation.city && browserLocation.city !== '不明' && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      都市
                    </TableCell>
                    <TableCell>{browserLocation.city}</TableCell>
                  </TableRow>
                )}
                {browserLocation.region && browserLocation.region !== '不明' && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      地域 / 州
                    </TableCell>
                    <TableCell>{browserLocation.region}</TableCell>
                  </TableRow>
                )}
                {browserLocation.country && browserLocation.country !== '不明' && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      国
                    </TableCell>
                    <TableCell>{browserLocation.country}</TableCell>
                  </TableRow>
                )}
                {browserLocation.address && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      住所
                    </TableCell>
                    <TableCell>{browserLocation.address}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={getGeolocation}
              startIcon={<LocationOnIcon />}
            >
              再取得
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${browserLocation.latitude},${browserLocation.longitude}`, '_blank')}
            >
              Google Mapsで開く
            </Button>
          </Box>
        </Paper>
      )}

      {/* エラーメッセージ */}
      {geoError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {geoError}
        </Alert>
      )}
    </Stack>
  );
};

GeolocationTab.propTypes = {
  hidden: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  browserLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    address: PropTypes.string,
    city: PropTypes.string,
    region: PropTypes.string,
    country: PropTypes.string,
  }),
  geoLoading: PropTypes.bool.isRequired,
  geoError: PropTypes.string,
  API_BASE_URL: PropTypes.string.isRequired,
  setGeoLoading: PropTypes.func.isRequired,
  setGeoError: PropTypes.func.isRequired,
  setBrowserLocation: PropTypes.func.isRequired,
  setSelectedCity: PropTypes.func.isRequired,
  updateWeatherData: PropTypes.func.isRequired,
  locationData: PropTypes.shape({
    country: PropTypes.string,
  }).isRequired,
};

export default GeolocationTab;