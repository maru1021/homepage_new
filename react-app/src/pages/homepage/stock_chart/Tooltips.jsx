import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// 数値をフォーマットする関数
const formatNumber = (num) => {
  return new Intl.NumberFormat('ja-JP').format(num);
};

// カスタムツールチップ
export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length || !payload[0].payload) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid', borderColor: 'grey.300', boxShadow: 3, borderRadius: 1, fontSize: '0.875rem' }}>
      <Typography fontWeight="bold" mb={1}>{label}</Typography>
      <Box component="table" width="100%">
        <Box component="tbody">
          <Box component="tr">
            <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>始値:</Box>
            <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.open.toFixed(2))}</Box>
          </Box>
          <Box component="tr">
            <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>高値:</Box>
            <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.high.toFixed(2))}</Box>
          </Box>
          <Box component="tr">
            <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>安値:</Box>
            <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.low.toFixed(2))}</Box>
          </Box>
          <Box component="tr">
            <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>終値:</Box>
            <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.close.toFixed(2))}</Box>
          </Box>
          {data.sma5 && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>SMA(5):</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.sma5.toFixed(2))}</Box>
            </Box>
          )}
          {data.sma25 && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>SMA(25):</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.sma25.toFixed(2))}</Box>
            </Box>
          )}
          {data.sma75 && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>SMA(75):</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.sma75.toFixed(2))}</Box>
            </Box>
          )}
          {data.upperBand && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>BB(2σ)上限:</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.upperBand.toFixed(2))}</Box>
            </Box>
          )}
          {data.lowerBand && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>BB(2σ)下限:</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.lowerBand.toFixed(2))}</Box>
            </Box>
          )}
          {data.upperBand3 && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>BB(3σ)上限:</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.upperBand3.toFixed(2))}</Box>
            </Box>
          )}
          {data.lowerBand3 && (
            <Box component="tr">
              <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>BB(3σ)下限:</Box>
              <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.lowerBand3.toFixed(2))}</Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool.isRequired,
  payload: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired
};

// 出来高用ツールチップ
export const VolumeTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length || !payload[0].payload) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid', borderColor: 'grey.300', boxShadow: 3, borderRadius: 1, fontSize: '0.875rem' }}>
      <Typography fontWeight="bold" mb={1}>{label}</Typography>
      <Box component="table">
        <Box component="tbody">
          <Box component="tr">
            <Box component="td" sx={{ color: 'text.secondary', pr: 2 }}>出来高:</Box>
            <Box component="td" sx={{ textAlign: 'right', fontWeight: 500 }}>{formatNumber(data.volume)}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

VolumeTooltip.propTypes = {
  active: PropTypes.bool.isRequired,
  payload: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired
};
