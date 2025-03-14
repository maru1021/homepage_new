import React, { useState } from 'react';
import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaIndustry, FaUsers, FaToolbox, FaChevronDown, FaChevronRight, FaCogs } from 'react-icons/fa';
import { Logout as LogoutIcon } from '@mui/icons-material';
import '../..//CSS/sidebar.css';

function ProductionManagementSidebar({ setToken, setSidebar }) {
  const navigate = useNavigate();

  const [openManufacturing, setOpenManufacturing] = useState(false);
  const [openTools, setOpenTools] = useState(false);
  const [openGeneral, setOpenGeneral] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        background: 'rgba(250, 250, 250, 0.9)',
        boxShadow: 'inset 4px 4px 10px rgba(209, 217, 230, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.6)',
        padding: '10px',
        flexShrink: 0,
      }}
    >
      <List sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#666', mb: 2 }}>
          メニュー
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* 製造部 */}
        <ListItem
          button
          onClick={() => setOpenManufacturing(!openManufacturing)}
          sx={{
            borderRadius: '10px',
            transition: '0.2s ease-in-out',
            background: openManufacturing ? 'rgba(180, 230, 255, 0.4)' : 'transparent',
            '&:hover': { background: 'rgba(255, 255, 255, 0.8)', transform: 'scale(1.02)' },
          }}
        >
          <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
            <FaIndustry />
          </ListItemIcon>
          <ListItemText primary="製造部" />
          {openManufacturing ? <FaChevronDown /> : <FaChevronRight />}
        </ListItem>
        <Collapse in={openManufacturing} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button onClick={() => navigate('/progress')}>
              <ListItemText primary="進捗" />
            </ListItem>
            <ListItem button onClick={() => navigate('/materials')}>
              <ListItemText primary="素材一覧" />
            </ListItem>
            <ListItem button onClick={() => setOpenTools(!openTools)}>
              <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
                <FaToolbox />
              </ListItemIcon>
              <ListItemText primary="工具管理" />
              {openTools ? <FaChevronDown /> : <FaChevronRight />}
            </ListItem>
            <Collapse in={openTools} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                <ListItem button onClick={() => navigate('/tools/shuken')}>
                  <ListItemText primary="集研" />
                </ListItem>
                <ListItem button onClick={() => navigate('/tools/preset')}>
                  <ListItemText primary="プリセット" />
                </ListItem>
                <ListItem button onClick={() => navigate('/tools/change')}>
                  <ListItemText primary="工具交換" />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Collapse>

        {/* 総務部 */}
        <ListItem
          button
          onClick={() => setOpenGeneral(!openGeneral)}
          sx={{
            borderRadius: '10px',
            transition: '0.2s ease-in-out',
            background: openGeneral ? 'rgba(180, 230, 255, 0.4)' : 'transparent',
            '&:hover': { background: 'rgba(255, 255, 255, 0.8)', transform: 'scale(1.02)' },
          }}
        >
          <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
            <FaUsers />
          </ListItemIcon>
          <ListItemText primary="総務部" />
          {openGeneral ? <FaChevronDown /> : <FaChevronRight />}
        </ListItem>
        <Collapse in={openGeneral} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button onClick={() => navigate('/general/department')}>
              <ListItemText primary="部署一覧" />
            </ListItem>
            <ListItem button onClick={() => navigate('/general/employee')}>
              <ListItemText primary="従業員一覧" />
            </ListItem>
            <ListItem button onClick={() => navigate('/authority/employee_authority')}>
              <ListItemText primary="従業員権限一覧" />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ mt: 'auto', mb: 2 }} />

        <ListItem
          button
          onClick={() => setSidebar("homepage")}
          sx={{
            borderRadius: '10px',
            transition: '0.2s ease-in-out',
            background: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { background: 'rgba(180, 230, 255, 0.4)', transform: 'scale(1.02)' },
          }}
        >
          <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
            <FaCogs />
          </ListItemIcon>
          <ListItemText primary="ホームページ" />
        </ListItem>

        {/* ログアウト */}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            transition: '0.2s ease-in-out',
            background: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              background: 'rgba(255, 100, 100, 0.1)',
              transform: 'scale(1.02)'
            },
          }}
        >
          <ListItemIcon sx={{ 
            color: '#f44336',
            opacity: 0.8 
          }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="ログアウト"
            sx={{
              color: '#f44336'
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}

ProductionManagementSidebar.propTypes = {
  setToken: PropTypes.func.isRequired,
  setSidebar: PropTypes.func.isRequired,
};

export default ProductionManagementSidebar;
