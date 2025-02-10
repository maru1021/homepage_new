import React, { useState, useEffect } from 'react';
import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaIndustry, FaUsers, FaSignOutAlt, FaToolbox } from 'react-icons/fa';
import './CSS/sidebar.css';

function Sidebar({ setToken }) {
  const navigate = useNavigate();

  const [openManufacturing, setOpenManufacturing] = useState(
    JSON.parse(localStorage.getItem('openManufacturing')) || false
  );
  const [openTools, setOpenTools] = useState(
    JSON.parse(localStorage.getItem('openTools')) || false
  );
  const [openGeneral, setOpenGeneral] = useState(
    JSON.parse(localStorage.getItem('openGeneral')) || false
  );

  useEffect(() => {
    localStorage.setItem('openManufacturing', JSON.stringify(openManufacturing));
    localStorage.setItem('openTools', JSON.stringify(openTools));
    localStorage.setItem('openGeneral', JSON.stringify(openGeneral));
  }, [openManufacturing, openTools, openGeneral]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        background: 'rgba(250, 250, 250, 0.6)', // 柔らかい背景
        boxShadow: 'inset 4px 4px 10px rgba(209, 217, 230, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.6)', // ニューモーフィズム風の影
        padding: "10px"
      }}
    >
      <List sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#666",
            mb: 2,
          }}
        >
          メニュー
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* 製造部 */}
        <ListItem
          button
          onClick={() => setOpenManufacturing(!openManufacturing)}
          sx={{
            borderRadius: "10px",
            transition: "0.2s ease-in-out",
            "&:hover": { background: "rgba(255, 255, 255, 0.8)", transform: "scale(1.02)" },
          }}
        >
          <ListItemIcon sx={{ color: "#666", opacity: 0.8 }}>
            <FaIndustry />
          </ListItemIcon>
          <ListItemText primary="製造部" />
        </ListItem>
        <Collapse in={openManufacturing} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button>
              <ListItemText primary="進捗" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="素材一覧" />
            </ListItem>
            <ListItem button onClick={() => setOpenTools(!openTools)}>
              <ListItemIcon sx={{ color: "#666", opacity: 0.8 }}>
                <FaToolbox />
              </ListItemIcon>
              <ListItemText primary="工具管理" />
            </ListItem>
            <Collapse in={openTools} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                <ListItem button>
                  <ListItemText primary="集研" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="プリセット" />
                </ListItem>
                <ListItem button>
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
            borderRadius: "10px",
            transition: "0.2s ease-in-out",
            "&:hover": { background: "rgba(255, 255, 255, 0.8)", transform: "scale(1.02)" },
          }}
        >
          <ListItemIcon sx={{ color: "#666", opacity: 0.8 }}>
            <FaUsers />
          </ListItemIcon>
          <ListItemText primary="総務部" />
        </ListItem>
        <Collapse in={openGeneral} timeout='auto' unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button component='a' href='/general/department'>
              <ListItemText primary='部署一覧' />
            </ListItem>
            <ListItem button component='a' href='/general/employee'>
              <ListItemText primary='従業員一覧' />
            </ListItem>
            <ListItem button component='a' href='/authority/employee_authority'>
              <ListItemText primary='従業員権限一覧' />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ mt: "auto", mb: 2 }} />

        {/* ログアウト */}
        <ListItem sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<FaSignOutAlt />}
            onClick={handleLogout}
            sx={{
              width: "90%",
              background: "#e57373",
              color: "white",
              fontWeight: "bold",
              borderRadius: "10px",
              transition: "0.2s ease-in-out",
              "&:hover": { background: "#ef5350", transform: "scale(1.03)" },
              "&:active": { background: "#e57373" },
            }}
          >
            ログアウト
          </Button>
        </ListItem>
      </List>
    </Drawer>
  );
}

Sidebar.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Sidebar;
