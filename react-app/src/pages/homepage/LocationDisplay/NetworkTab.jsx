import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableRow,
  Stack, Typography
} from '@mui/material';

const NetworkTab = ({ hidden, active, locationData }) => {
  if (hidden || !active) return null;

  return (
    <Stack spacing={2}>
      <TableContainer component={Paper} variant="outlined">
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
            <TableRow>
              <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
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
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        ※ IPアドレスから推定されたプロバイダの情報です。
      </Typography>
    </Stack>
  );
};

NetworkTab.propTypes = {
  hidden: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  locationData: PropTypes.shape({
    ip: PropTypes.string,
    country: PropTypes.string,
    region: PropTypes.string,
    city: PropTypes.string,
    timezone: PropTypes.string,
    isp: PropTypes.string,
  }).isRequired,
};

export default NetworkTab;