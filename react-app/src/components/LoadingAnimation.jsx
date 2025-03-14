import PropTypes from 'prop-types';

import {
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

const LoadingAnimation = ({ loadingText = 'データを読み込んでいます...' }) => (
  <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 3,
      width: '100%'
  }}>
      <CircularProgress
          size={50}
          thickness={4}
          sx={{
              color: '#3498db',
              opacity: 0.8
          }}
      />
      <Typography
          variant="body1"
          sx={{
              color: '#64748b',
              fontWeight: 500
          }}
      >
          {loadingText}
      </Typography>
  </Box>
);

LoadingAnimation.propTypes = {
  loadingText: PropTypes.string
};

export default LoadingAnimation;