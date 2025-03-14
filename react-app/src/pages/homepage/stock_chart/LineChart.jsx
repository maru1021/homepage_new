import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Box, Typography } from '@mui/material';

const LineChart = ({
  stockData,
  showSMA,
  showBB,
  showBB3,
  formatNumber,
  CustomTooltip
}) => {
  if (!stockData || stockData.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography>データがありません</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={stockData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          domain={[
            (Math.min(...stockData.map(d => d.low)) * 0.99) || 0,
            (Math.max(...stockData.map(d => d.high)) * 1.01) || 100
          ]}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatNumber(value.toFixed(0))}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* ボリンジャーバンド3σ */}
        {showBB3 && (
          <>
            <Line
              type="monotone"
              name="BB(3σ)上限"
              dataKey="upperBand3"
              stroke="#e57373"
              dot={false}
              activeDot={false}
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              name="BB(3σ)下限"
              dataKey="lowerBand3"
              stroke="#e57373"
              dot={false}
              activeDot={false}
              strokeDasharray="3 3"
            />
          </>
        )}

        {/* ボリンジャーバンド2σ */}
        {showBB && (
          <>
            <Line
              type="monotone"
              name="BB(2σ)上限"
              dataKey="upperBand"
              stroke="#9fa8da"
              dot={false}
              activeDot={false}
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              name="BB(2σ)下限"
              dataKey="lowerBand"
              stroke="#9fa8da"
              dot={false}
              activeDot={false}
              strokeDasharray="3 3"
            />
          </>
        )}

        {/* 移動平均線 */}
        {showSMA.sma5 && (
          <Line
            type="monotone"
            name="SMA(5)"
            dataKey="sma5"
            stroke="#ff9800"
            dot={false}
            strokeWidth={1.5}
          />
        )}

        {showSMA.sma25 && (
          <Line
            type="monotone"
            name="SMA(25)"
            dataKey="sma25"
            stroke="#42a5f5"
            dot={false}
            strokeWidth={1.5}
          />
        )}

        {showSMA.sma75 && (
          <Line
            type="monotone"
            name="SMA(75)"
            dataKey="sma75"
            stroke="#9c27b0"
            dot={false}
            strokeWidth={1.5}
          />
        )}

        {/* メインチャート */}
        <Line
          type="monotone"
          name="価格"
          dataKey="close"
          stroke="#ff7043"
          dot={false}
          strokeWidth={2}
        />

        {/* ゼロ変化ライン */}
        <ReferenceLine
          y={stockData.length > 1 ? stockData[stockData.length - 2].close : stockData[0].close}
          stroke="#888"
          strokeDasharray="3 3"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

LineChart.propTypes = {
  stockData: PropTypes.array.isRequired,
  showSMA: PropTypes.object.isRequired,
  showBB: PropTypes.bool.isRequired,
  showBB3: PropTypes.bool.isRequired,
  formatNumber: PropTypes.func.isRequired,
  CustomTooltip: PropTypes.func.isRequired
};

export default LineChart;