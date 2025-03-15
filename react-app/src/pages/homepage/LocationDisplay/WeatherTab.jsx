import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper,
  Select, Stack, Table, TableBody, TableCell, TableRow, Typography
} from '@mui/material';

import { CITIES } from './constants';

const WeatherTab = ({
  hidden,
  active,
  selectedCity,
  handleCityChange,
  weatherData
}) => {
  if (hidden || !active) return null;

  return (
    <Stack spacing={2}>
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel id="city-select-label">都市を選択</InputLabel>
        <Select
          labelId="city-select-label"
          id="city-select"
          value={selectedCity}
          onChange={handleCityChange}
          label="都市を選択"
        >
          {CITIES.map(city => (
            <MenuItem key={city} value={city}>{city}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {weatherData ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                  alt={weatherData.condition}
                  style={{ width: 80, height: 80 }}
                  onError={(e) => {
                    console.error('天気アイコンの読み込みに失敗:', e);
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI2ZmZDcwMCIgLz48L3N2Zz4='; // 黄色い丸のSVG
                  }}
                />
                <Typography variant="h3" component="div" sx={{ ml: 2 }}>
                  {weatherData.temperature}°C
                </Typography>
              </Box>
              <Typography variant="h6" component="div">
                {weatherData.condition}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedCity}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      湿度
                    </TableCell>
                    <TableCell>{weatherData.humidity}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      風速
                    </TableCell>
                    <TableCell>{weatherData.windSpeed} m/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      更新時間
                    </TableCell>
                    <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            気象情報を取得中...
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

WeatherTab.propTypes = {
  hidden: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  selectedCity: PropTypes.string.isRequired,
  handleCityChange: PropTypes.func.isRequired,
  weatherData: PropTypes.shape({
    temperature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    condition: PropTypes.string,
    humidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    windSpeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    icon: PropTypes.string,
  }),
};

export default WeatherTab;