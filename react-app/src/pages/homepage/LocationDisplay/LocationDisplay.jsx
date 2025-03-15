import React, { useState, useEffect } from 'react';
import {
  Typography, Box,
  Alert, Grid, Paper
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudIcon from '@mui/icons-material/Cloud';

import { API_BASE_URL } from '../../../config/baseURL';
import NetworkTab from './NetworkTab';
import SpeedTestTab from './SpeedTestTab';
import WeatherTab from './WeatherTab';
import GeolocationTab from './GeolocationTab';
import Loading from './Loading';
import { fetchLocationInfo, fetchWeatherData } from './api';

const LocationDisplay = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState({
    ip: '',
    country: '日本',
    region: '東京都',
    city: '東京',
    timezone: 'Asia/Tokyo',
    isp: ''
  });
  const [weatherData, setWeatherData] = useState(null);
  const [browserLocation, setBrowserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // プロバイダの情報を取得
  useEffect(() => {
    const getLocationData = async () => {
      try {
        const data = await fetchLocationInfo(API_BASE_URL);

        setLocationData({
          ip: data.ip,
          country: data.country || '不明',
          region: data.region || '不明',
          city: data.city || '不明',
          timezone: data.timezone || '不明',
          isp: data.isp || '不明'
        });

        // 位置情報が取得できた場合のみ選択都市を更新し、それ以外は東京を使用
        if (data.city && data.city !== '不明') {
          setSelectedCity(data.city);
          updateWeatherData(data.city, data.country);
        } else {
          // 位置情報が取得できない場合は東京を使用
          updateWeatherData('東京', '日本');
        }

        // ローディング完了までの時間を少し長めに設定して、かわいいローディング画面を楽しめるようにする
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (err) {
        console.error('位置情報の取得に失敗:', err);
        setError(err.message);
        setLoading(false);

        // エラー時も東京の天気情報を取得
        updateWeatherData('東京', '日本');
      }
    };

    getLocationData();
  }, []);

  // 天気情報を更新
  const updateWeatherData = async (city, country) => {
    try {
      // まず天気情報をnullにしてローディング表示を有効化
      setWeatherData(null);

      const data = await fetchWeatherData(API_BASE_URL, city || '東京', country || '日本');
      setWeatherData(data);
    } catch (error) {
      console.error('天気情報の取得中にエラーが発生しました:', error);
      // エラー時のデータ
      setWeatherData({
        temperature: '-',
        condition: '-',
        humidity: '-',
        windSpeed: '-',
        icon: '01d'
      });
    }
  };

  // 選択した都市が変更されたときに天気情報を更新
  useEffect(() => {
    if (selectedCity) {
      updateWeatherData(selectedCity, locationData.country);
    } else {
      // 選択された都市がない場合は東京を使用
      updateWeatherData('東京', '日本');
    }
  }, [selectedCity, locationData.country]);

  // 都市が変更されたときに選択都市の状態を更新
  const handleCityChange = (event) => {
    const newCity = event.target.value;

    // まず天気情報をnullにしてローディング表示を有効化
    setWeatherData(null);

    setSelectedCity(newCity);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        エラーが発生しました: {error}
      </Alert>
    );
  }

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    padding: '16px',
    backgroundColor: 'rgba(25, 118, 210, 0.05)'
  };

  const cardContentStyle = {
    padding: '16px',
    flexGrow: 1,
    overflow: 'auto',
    maxHeight: 'calc(100% - 60px)'
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Typography variant="h5" component="div" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <MyLocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        天気、ネットワーク情報など
      </Typography>

      <Grid container spacing={3}>


        {/* 通信速度 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={cardStyle}>
            <Box sx={cardHeaderStyle}>
              <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">通信速度</Typography>
            </Box>
            <Box sx={cardContentStyle}>
              <SpeedTestTab active={true} hidden={false} />
            </Box>
          </Paper>
        </Grid>

        {/* 気象情報 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={cardStyle}>
            <Box sx={cardHeaderStyle}>
              <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">気象情報</Typography>
            </Box>
            <Box sx={cardContentStyle}>
              <WeatherTab
                active={true}
                hidden={false}
                selectedCity={selectedCity}
                handleCityChange={handleCityChange}
                weatherData={weatherData}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 実際の位置情報 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={cardStyle}>
            <Box sx={cardHeaderStyle}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">実際の位置情報</Typography>
            </Box>
            <Box sx={cardContentStyle}>
              <GeolocationTab
                active={true}
                hidden={false}
                browserLocation={browserLocation}
                geoLoading={geoLoading}
                geoError={geoError}
                setGeoLoading={setGeoLoading}
                setGeoError={setGeoError}
                setBrowserLocation={setBrowserLocation}
                setSelectedCity={setSelectedCity}
                updateWeatherData={updateWeatherData}
                locationData={locationData}
                API_BASE_URL={API_BASE_URL}
              />
            </Box>
          </Paper>
        </Grid>

        {/* ネットワーク情報 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={cardStyle}>
            <Box sx={cardHeaderStyle}>
              <WifiIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">ネットワーク情報</Typography>
            </Box>
            <Box sx={cardContentStyle}>
              <NetworkTab active={true} hidden={false} locationData={locationData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationDisplay;