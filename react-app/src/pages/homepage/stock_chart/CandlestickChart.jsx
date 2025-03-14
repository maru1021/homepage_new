/* eslint-disable react/prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter
} from 'recharts';
import { Box, Typography } from '@mui/material';


const WickShape = (props) => {
  if (!props || !props.cx || !props.cy || !props.payload || !props.yAxis ||
      !props.yAxis.scale || !props.payload.low || !props.payload.color) {
    return null;
  }

  const { cx, cy, payload, yAxis } = props;

  return (
    <line
      x1={cx}
      y1={cy}
      x2={cx}
      y2={yAxis.scale(payload.low)}
      stroke={payload.color}
      strokeWidth={1}
    />
  );
};


const BodyShape = (props) => {
  if (!props || !props.cx || !props.payload || !props.yAxis ||
      !props.yAxis.scale || !props.payload.bodyStart || !props.payload.bodyEnd) {
    return null;
  }

  const { cx, payload, yAxis, stockData, containerRef } = props;
  const rectWidth = Math.max(containerRef ? (containerRef.clientWidth - 60) / stockData.length - 4 : 5, 3);
  const bodyStartY = yAxis.scale(payload.bodyStart);
  const bodyEndY = yAxis.scale(payload.bodyEnd);
  const bodyHeight = Math.abs(bodyStartY - bodyEndY);

  return (
    <rect
      x={cx - rectWidth / 2}
      y={Math.min(bodyStartY, bodyEndY)}
      width={rectWidth}
      height={Math.max(bodyHeight, 1)}
      fill={payload.color || '#000000'}
    />
  );
};

const CandlestickChart = ({
  stockData,
  showSMA,
  showBB,
  showBB3,
  formatNumber,
  CustomTooltip,
  containerRef
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
      <ComposedChart
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

        {/* ボリンジャーバンド3σ（新規追加） */}
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

        {/* ローソク足 - ヒゲの部分 */}
        <Scatter
          name="ローソク足"
          dataKey="high"
          // eslint-disable-next-line react/prop-types
          shape={(props) => <WickShape {...props} />}
          fill="#8884d8"
          legendType="none"
        />

        {/* ローソク足 - 実体部分 */}
        <Scatter
          name="ローソク足"
          dataKey="close"
          // eslint-disable-next-line react/prop-types
          shape={(props) => <BodyShape {...props} stockData={stockData} containerRef={containerRef.current} />}
          fill="#8884d8"
          legendType="none"
        />

        {/* ゼロ変化ライン */}
        <ReferenceLine
          y={stockData.length > 1 ? stockData[stockData.length - 2].close : stockData[0].close}
          stroke="#888"
          strokeDasharray="3 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

CandlestickChart.propTypes = {
  stockData: PropTypes.array.isRequired,
  showSMA: PropTypes.object.isRequired,
  showBB: PropTypes.bool.isRequired,
  showBB3: PropTypes.bool.isRequired,
  formatNumber: PropTypes.func.isRequired,
  CustomTooltip: PropTypes.func.isRequired,
  containerRef: PropTypes.object.isRequired
};

export default CandlestickChart;