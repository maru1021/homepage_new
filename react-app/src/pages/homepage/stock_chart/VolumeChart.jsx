import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

const VolumeChart = ({ volumeData, formatNumber, VolumeTooltip }) => {
  if (!volumeData || volumeData.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography>出来高データがありません</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={volumeData}
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
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            return formatNumber(value);
          }}
        />
        <Tooltip content={<VolumeTooltip />} />
        <Bar dataKey="volume" name="出来高">
          {volumeData.map((entry, index) => (
            <rect
              key={`volume-${index}`}
              fill={entry.isUp ? "#26A69A" : "#EF5350"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

VolumeChart.propTypes = {
  volumeData: PropTypes.array.isRequired,
  formatNumber: PropTypes.func.isRequired,
  VolumeTooltip: PropTypes.func.isRequired
};

export default VolumeChart;