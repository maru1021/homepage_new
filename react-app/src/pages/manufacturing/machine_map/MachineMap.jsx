import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../../config/baseURL';

// 工場建物のSVGアイコンコンポーネント
const FactoryBuildingIcon = ({ size = 48, color = "#60a5fa", operatingCondition = "稼働中" }) => {
  const getColors = () => {
    switch(operatingCondition) {
      case "停止中":
        return { main: "#dc2626", secondary: "#991b1b", light: "#f87171" };
      case "計画停止":
        return { main: "#eab308", secondary: "#a16207", light: "#facc15" };
      default: // 稼働中
        return { main: "#3b82f6", secondary: "#2563eb", light: "#60a5fa" };
    }
  };

  const colors = getColors();

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="8" width="20" height="12" rx="1" fill={colors.main}/>
      <rect x="4" y="4" width="6" height="4" fill={colors.secondary}/>
      <rect x="14" y="6" width="4" height="2" fill={colors.secondary}/>
      <circle cx="7" cy="11" r="1" fill={colors.light}/>
      <circle cx="12" cy="11" r="1" fill={colors.light}/>
      <circle cx="17" cy="11" r="1" fill={colors.light}/>
      <rect x="6" y="14" width="2" height="6" fill={colors.secondary}/>
      <rect x="11" y="14" width="2" height="6" fill={colors.secondary}/>
      <rect x="16" y="14" width="2" height="6" fill={colors.secondary}/>
      <path d="M2 8L7 4L12 8" stroke={colors.secondary} strokeWidth="2"/>
    </svg>
  );
};

FactoryBuildingIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  operatingCondition: PropTypes.string
};

// 煙のSVGアニメーション
const SmokeAnimation = ({ size = 40 }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none">
    <circle cx="8" cy="20" r="1.5" fill="#94a3b8" opacity="0.7">
      <animate attributeName="cy" values="20;5;20" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="20" r="2" fill="#cbd5e1" opacity="0.6">
      <animate attributeName="cy" values="20;3;20" dur="3.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="16" cy="20" r="1.5" fill="#94a3b8" opacity="0.8">
      <animate attributeName="cy" values="20;7;20" dur="2.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="20" cy="20" r="2.5" fill="#e2e8f0" opacity="0.5">
      <animate attributeName="cy" values="20;2;20" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="24" cy="20" r="1.8" fill="#94a3b8" opacity="0.6">
      <animate attributeName="cy" values="20;6;20" dur="3.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="28" cy="20" r="2.2" fill="#cbd5e1" opacity="0.7">
      <animate attributeName="cy" values="20;4;20" dur="3.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="32" cy="20" r="1.5" fill="#94a3b8" opacity="0.5">
      <animate attributeName="cy" values="20;8;20" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

SmokeAnimation.propTypes = {
  size: PropTypes.number
};

// 機械名表示コンポーネント
const MachineName = ({ name, operatingCondition = "稼働中" }) => {
  const getBorderColor = () => {
    switch(operatingCondition) {
      case "停止中":
        return "#dc2626";
      case "計画停止":
        return "#eab308";
      default: // 稼働中
        return "#3b82f6";
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#1f2937',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '6px 12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        border: `2px solid ${getBorderColor()}`,
        minWidth: '120px',
        maxWidth: '160px',
        zIndex: 10
      }}
    >
      {name}
    </Box>
  );
};

MachineName.propTypes = {
  name: PropTypes.string.isRequired,
  operatingCondition: PropTypes.string
};

// 煙コンテナコンポーネント
const SmokeContainer = () => (
  <Box
    sx={{
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 5
    }}
  >
    <SmokeAnimation size={40} />
  </Box>
);

// 工場アイコンコンテナコンポーネント
const FactoryIconContainer = ({ operatingCondition }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: '5px',
      left: '50%',
      transform: 'translateX(-50%)'
    }}
  >
    <FactoryBuildingIcon size={80} operatingCondition={operatingCondition} />
  </Box>
);

FactoryIconContainer.propTypes = {
  operatingCondition: PropTypes.string
};

// 建物コンテナコンポーネント
const BuildingContainer = ({ children, onMouseEnter, onMouseLeave, operatingCondition = "稼働中" }) => {
  const getBorderColor = () => {
    switch(operatingCondition) {
      case "停止中":
        return "#dc2626";
      case "計画停止":
        return "#eab308";
      default: // 稼働中
        return "#3b82f6";
    }
  };

  const getHoverColor = () => {
    switch(operatingCondition) {
      case "停止中":
        return "rgba(220, 38, 38, 0.4)";
      case "計画停止":
        return "rgba(234, 179, 8, 0.4)";
      default: // 稼働中
        return "rgba(59, 130, 246, 0.4)";
    }
  };

  return (
    <Box
      className="building-container"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        padding: '15px',
        paddingBottom: '10px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        border: `4px solid ${getBorderColor()}`,
        transition: 'all 0.3s ease',
        width: '180px',
        height: '180px',
        overflow: 'hidden',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 8px 20px ${getHoverColor()}`
        }
      }}
    >
      {children}
    </Box>
  );
};

BuildingContainer.propTypes = {
  children: PropTypes.node.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  operatingCondition: PropTypes.string
};

// メインの機械アイコンコンポーネント
const MachineIcon = ({ machineName, x, y, lineId, onClick, operatingCondition }) => {
  return (
    <Box
      onClick={() => onClick(lineId)}
      sx={{
        position: 'absolute',
        left: `${x + 200}px`,
        top: `${y}px`,
        width: '200px',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <BuildingContainer operatingCondition={operatingCondition}>
        <MachineName name={machineName} operatingCondition={operatingCondition} />
        <SmokeContainer />
        <FactoryIconContainer operatingCondition={operatingCondition} />
      </BuildingContainer>
    </Box>
  );
};

MachineIcon.propTypes = {
  machineName: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  lineId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func.isRequired,
  operatingCondition: PropTypes.string
};

// ローディングコンポーネント
const LoadingComponent = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Typography variant="h6" color="#6b7280">
      Loading...
    </Typography>
  </Box>
);

// エラーコンポーネント
const ErrorComponent = ({ error }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Box
      sx={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        padding: '24px',
        borderRadius: '8px'
      }}
    >
      <Typography component="strong">Error:</Typography> {error}
    </Box>
  </Box>
);

ErrorComponent.propTypes = {
  error: PropTypes.string.isRequired
};

// マップコンテナコンポーネント
const MapContainer = ({ children }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      overflow: 'hidden'
    }}
  >
    {children}
  </Box>
);

MapContainer.propTypes = {
  children: PropTypes.node.isRequired
};

// メインのLineMapコンポーネント
const MachineMap = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { lineId } = useParams();

  const handleLineClick = (lineId) => {
    navigate(`/manufacturing/machine_map/${lineId}`);
  };

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/manufacturing/machine_map/${lineId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(result.message || 'API returned success: false');
        }

        const linesData = result?.data || [];

        if (!Array.isArray(linesData)) {
          throw new Error('Received data is not an array');
        }

        setLines(linesData);
        setError(null);

      } catch (err) {
        console.error('データの取得に失敗しました:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLines();

    const intervalId = setInterval(fetchLines, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lineId]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <MapContainer>
      {lines.map((line) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const x = (line.position_x / 1000) * screenWidth + 100;
        const y = (line.position_y / 1000) * screenHeight;

        return (
          <MachineIcon
            key={line.id}
            lineId={line.id}
            machineName={line.name}
            x={x}
            y={y}
            onClick={handleLineClick}
            operatingCondition={line.operating_condition}
          />
        );
      })}
    </MapContainer>
  );
};

export default MachineMap;