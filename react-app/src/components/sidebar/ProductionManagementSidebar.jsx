import React, { useState, useEffect } from 'react';
import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Box, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaIndustry,
  FaUsers,
  FaToolbox,
  FaChevronDown,
  FaChevronRight,
  FaMapMarkedAlt,
  FaWarehouse,
  FaClipboardList,
  FaWrench,
  FaExchangeAlt,
  FaBuilding,
  FaIdCard,
  FaUserShield,
  FaHome,
  FaBullhorn,
  FaDatabase
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { Logout as LogoutIcon } from '@mui/icons-material';
import AuthService from '../../services/auth';
import { API_BASE_URL } from '../../config/baseURL';
import '../..//CSS/sidebar.css';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

function ProductionManagementSidebar({ setToken, setSidebar, mobileOpen = false, onClose = () => {}, isMobile = false }) {
  const navigate = useNavigate();

  const [openAll, setOpenAll] = useState(false);
  const [openManufacturing, setOpenManufacturing] = useState(false);
  const [openTools, setOpenTools] = useState(false);
  const [openGeneral, setOpenGeneral] = useState(false);
  const [openInformationSystem, setOpenInformationSystem] = useState(false);
  const [userDepartments, setUserDepartments] = useState([]);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [openMaster, setOpenMaster] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setUserDepartments(data.departments || []);
        setIsSystemAdmin(data.is_system_admin || false);
        setUserName(data.name || '');
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    setToken(false);
    navigate('/login');
  };

  // 部署に基づいて表示を制御する関数
  const hasDepartmentAccess = (departmentName) => {
    if (isSystemAdmin) return true;
    return userDepartments.some(dept =>
      dept.name === departmentName ||
      (dept.name === '管理者' && ['製造部', '総務部', '情報システム室'].includes(departmentName))  // 管理者は全ての部署にアクセス可能
    );
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      anchor="left"
      ModalProps={{
        keepMounted: true
      }}
      sx={{
        display: { xs: 'block', sm: 'block' },
        '& .MuiDrawer-paper': {
          background: 'rgba(250, 250, 250, 0.9)',
          boxShadow: 'inset 4px 4px 10px rgba(209, 217, 230, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.6)',
          padding: '10px',
          border: 'none',
          position: 'fixed',
          maxWidth: '320px'
        }
      }}
    >
      {/* ユーザー情報 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          mb: 1
        }}
      >
        <Avatar
          sx={{
            width: 50,
            height: 50,
            mb: 1,
            bgcolor: 'primary.main',
            fontSize: '1.5rem'
          }}
        >
          {userName ? userName.charAt(0) : ''}
        </Avatar>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            color: '#666',
            textAlign: 'center'
          }}
        >
          {userName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666',
            opacity: 0.8,
            textAlign: 'center'
          }}
        >
          {userDepartments.map(dept => dept.name).join(', ')}
        </Typography>
      </Box>
      <List sx={{ p: 2 }}>

        {/* 全体 - 全ユーザーに表示 */}
        <ListItem
          button
          onClick={() => setOpenAll(!openAll)}
          sx={{
            borderRadius: '10px',
            transition: '0.2s ease-in-out',
            background: openAll ? 'rgba(180, 230, 255, 0.4)' : 'transparent',
            '&:hover': { background: 'rgba(255, 255, 255, 0.8)', transform: 'scale(1.02)' },
          }}
        >
          <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
            <MdDashboard size={20} />
          </ListItemIcon>
          <ListItemText primary="全体" />
          {openAll ? <FaChevronDown /> : <FaChevronRight />}
        </ListItem>
        <Collapse in={openAll} timeout="auto" unmountOnExit>
          <List sx={{ pl: 4 }}>
            <ListItem button onClick={() => navigate('/all/bulletin_board/list')}>
              <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                <FaBullhorn size={16} />
              </ListItemIcon>
              <ListItemText primary="掲示板一覧" />
            </ListItem>
          </List>
        </Collapse>

        {/* 製造部 - 製造部のユーザーのみ表示 */}
        {hasDepartmentAccess('製造部') && (
          <>
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
                <ListItem button onClick={() => navigate('/manufacturing/line_map')}>
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaMapMarkedAlt size={16} />
                  </ListItemIcon>
                  <ListItemText primary="マップ" />
                </ListItem>
                <ListItem button onClick={() => navigate('/materials')}>
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaWarehouse size={16} />
                  </ListItemIcon>
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
                      <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                        <FaClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="集研" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/tools/preset')}>
                      <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                        <FaWrench size={16} />
                      </ListItemIcon>
                      <ListItemText primary="プリセット" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/tools/change')}>
                      <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                        <FaExchangeAlt size={16} />
                      </ListItemIcon>
                      <ListItemText primary="工具交換" />
                    </ListItem>
                  </List>
                </Collapse>

                {/* マスター管理 */}
                <ListItem button onClick={() => setOpenMaster(!openMaster)}>
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaDatabase size={16} />
                  </ListItemIcon>
                  <ListItemText primary="マスター管理" />
                  {openMaster ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openMaster} timeout="auto" unmountOnExit>
                  <List sx={{ pl: 4 }}>
                    <ListItem button onClick={() => navigate('/manufacturing/master/line')}>
                      <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                        <FaIndustry size={16} />
                      </ListItemIcon>
                      <ListItemText primary="ライン" />
                    </ListItem>
                  </List>
                  <List sx={{ pl: 4 }}>
                    <ListItem button onClick={() => navigate('/manufacturing/master/machine')}>
                      <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                        <FaIndustry size={16} />
                      </ListItemIcon>
                      <ListItemText primary="設備" />
                    </ListItem>
                  </List>
                </Collapse>
              </List>
            </Collapse>
          </>
        )}

        {/* 総務部 - 総務部のユーザーのみ表示 */}
        {hasDepartmentAccess('総務部') && (
          <>
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
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaBuilding size={16} />
                  </ListItemIcon>
                  <ListItemText primary="部署一覧" />
                </ListItem>
                <ListItem button onClick={() => navigate('/general/employee')}>
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaIdCard size={16} />
                  </ListItemIcon>
                  <ListItemText primary="従業員一覧" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* 情報システム室 - 情報システム室のユーザーのみ表示 */}
        {hasDepartmentAccess('情報システム室') && (
          <>
            <ListItem
              button
              onClick={() => setOpenInformationSystem(!openInformationSystem)}
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
              <ListItemText primary="情報システム室" />
              {openInformationSystem ? <FaChevronDown /> : <FaChevronRight />}
            </ListItem>
            <Collapse in={openInformationSystem} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                <ListItem button onClick={() => navigate('/authority/employee_authority')}>
                  <ListItemIcon sx={{ color: '#666', opacity: 0.8, minWidth: '36px' }}>
                    <FaUserShield size={16} />
                  </ListItemIcon>
                  <ListItemText primary="従業員権限一覧" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

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
            <FaHome />
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
  mobileOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isMobile: PropTypes.bool
};

export default ProductionManagementSidebar;