import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Stack,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import PublicIcon from '@mui/icons-material/Public';

import { API_BASE_URL } from '../../../config/baseURL';

const LocationDisplay = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState({
    ip: '',
    country: '',
    region: '',
    city: '',
    timezone: '',
    isp: ''
  });

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/current_location/location`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'ロケーション情報の取得に失敗しました');
        }

        const data = await response.json();

        setLocationData({
          ip: data.ip,
          country: data.country || '不明',
          region: data.region || '不明',
          city: data.city || '不明',
          timezone: data.timezone || '不明',
          isp: data.isp || '不明'
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          位置情報を取得中...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        エラーが発生しました: {error}
      </Alert>
    );
  }

  return (
    <Card elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          <PublicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          現在の位置情報
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <WifiIcon sx={{ mr: 1 }} /> ネットワーク情報
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                      IPアドレス
                    </TableCell>
                    <TableCell>{locationData.ip}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      ISP / 組織
                    </TableCell>
                    <TableCell>{locationData.isp}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} /> 現在地
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                      国
                    </TableCell>
                    <TableCell>{locationData.country}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      地域 / 州
                    </TableCell>
                    <TableCell>{locationData.region}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      都市
                    </TableCell>
                    <TableCell>{locationData.city}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      タイムゾーン
                    </TableCell>
                    <TableCell>{locationData.timezone}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LocationDisplay;