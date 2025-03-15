import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Collapse,
} from '@mui/material';
import {
    FaCogs, FaCode, FaLayerGroup, FaTools, FaBook,
    FaDatabase, FaServer, FaDesktop, FaCloud, FaHtml5,
    FaCss3Alt, FaBootstrap, FaLinux, FaMoneyBill
} from 'react-icons/fa';
import {
    DiReact, DiPython, DiJavascript1, DiPhp, DiRuby,
    DiDjango, DiLaravel, DiDocker, DiAws, DiGit,
} from 'react-icons/di';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
    SiFastapi,SiRubyonrails
} from 'react-icons/si';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Article as ArticleIcon,
    PostAdd as PostAddIcon,
    Login as LoginIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../config/baseURL';
import '../../CSS/sidebar.css';


function HomepageSidebar({ setToken, setSidebar, mobileOpen = false, onClose = () => {}, isMobile = false, onLinkClick }) {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [openTypes, setOpenTypes] = useState({});
    const [openClassifications, setOpenClassifications] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 項目と分類データを取得
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/side_bar`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTypes(data.types || []);
            } catch (error) {
                console.error('Error fetching hierarchy:', error);
            }
        };
        fetchData();
    }, []);

    // トークンの存在をチェック
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // 項目の開閉状態を切り替え
    const handleTypeClick = (typeId) => {
        setOpenTypes(prev => ({
            ...prev,
            [typeId]: !prev[typeId]
        }));
    };

    // 分類の開閉状態を切り替え
    const handleClassificationClick = (classificationId) => {
        setOpenClassifications(prev => ({
            ...prev,
            [classificationId]: !prev[classificationId]
        }));
    };

    // アイコンを選択する関数（項目用）
    const getTypeIcon = (typeName) => {
        const iconStyle = { fontSize: '1.2rem' };
        switch (typeName.toLowerCase()) {
            case 'プログラミング基礎':
                return <FaCode style={{ ...iconStyle, color: '#64B5F6' }} />;
            case 'フレームワーク':
                return <FaLayerGroup style={{ ...iconStyle, color: '#BA68C8' }} />;
            case 'データベース':
                return <FaDatabase style={{ ...iconStyle, color: '#FFB74D' }} />;
            case 'インフラ':
                return <FaCloud style={{ ...iconStyle, color: '#4FC3F7' }} />;
            case 'フロントエンド':
                return <FaDesktop style={{ ...iconStyle, color: '#81C784' }} />;
            case 'バックエンド':
                return <FaServer style={{ ...iconStyle, color: '#90A4AE' }} />;
            case 'その他':
                return <FaTools style={{ ...iconStyle, color: '#A1887F' }} />;
            default:
                return <FaBook style={{ ...iconStyle, color: '#BDBDBD' }} />;
        }
    };

    // アイコンを選択する関数
    const getClassificationIcon = (name) => {
        const iconStyle = { fontSize: '1rem' };
        switch (name.toLowerCase()) {
            case 'javascript':
                return <DiJavascript1 style={{ ...iconStyle, color: '#FDD835' }} />;
            case 'python':
                return <DiPython style={{ ...iconStyle, color: '#42A5F5' }} />;
            case 'php':
                return <DiPhp style={{ ...iconStyle, color: '#9575CD' }} />;
            case 'ruby':
                return <DiRuby style={{ ...iconStyle, color: '#EF5350' }} />;
            case 'html':
                return <FaHtml5 style={{ ...iconStyle, color: '#FF7043' }} />;
            case 'css':
                return <FaCss3Alt style={{ ...iconStyle, color: '#29B6F6' }} />;
            case 'react':
                return <DiReact style={{ ...iconStyle, color: '#4DD0E1' }} />;
            case 'django(基本)':
            case 'django(orm)':
                return <DiDjango style={{ ...iconStyle, color: '#2E7D32' }} />;
            case 'fastapi':
                return <SiFastapi style={{ ...iconStyle, color: '#26A69A' }} />;
            case 'laravel':
                return <DiLaravel style={{ ...iconStyle, color: '#FF7043' }} />;
            case 'bootstrap':
                return <FaBootstrap style={{ ...iconStyle, color: '#AB47BC' }} />;
            case 'ruby on rails':
            case 'ruby on rails(orm)':
                return <SiRubyonrails style={{ ...iconStyle, color: '#EF5350' }} />;
            case 'docker':
                return <DiDocker style={{ ...iconStyle, color: '#42A5F5' }} />;
            case 'aws':
                return <DiAws style={{ ...iconStyle, color: '#FFA726' }} />;
            case 'git':
                return <DiGit style={{ ...iconStyle, color: '#FF7043' }} />;
            case 'linux':
                return <FaLinux style={{ ...iconStyle, color: '#FFD54F' }} />;
            default:
                return <FaBook style={{ ...iconStyle, color: '#BDBDBD', opacity: 0.7 }} />;
        }
    };

    const menuItems = [
        // ログイン状態でのみ表示する項目
        ...(isLoggedIn ? [
            {
                text: '項目一覧',
                icon: <FaLayerGroup style={{ fontSize: '1.1rem' }} />,
                path: 'homepage/type',
            },
            {
                text: '分類一覧',
                icon: <FaBook style={{ fontSize: '1.1rem' }} />,
                path: 'homepage/classification',
            },
            {
                text: '株価チャート',
                icon: <FaMoneyBill style={{ fontSize: '1.1rem' }} />,
                path: 'homepage/stock_chart',
            }
        ] : []),
        // 常に表示する項目
        {
            text: '記事投稿',
            icon: <PostAddIcon />,
            path: '/homepage/article/new',
            color: '#4CAF50'
        },
        {
            text: '最新記事一覧',
            icon: <ArticleIcon />,
            path: '/',
        },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onLinkClick?.();
    };

    // ログアウト処理
    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setIsLoggedIn(false);
    };

    // ログインページへの遷移処理
    const handleLogin = () => {
        navigate('/login');
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
            <List sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#666', mb: 2 }}>
                    メニュー
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {menuItems.map((item, index) => (
                    <React.Fragment key={item.text}>
                        {index === (isLoggedIn ? 3 : 0) && <Divider sx={{ my: 1 }} />}
                        <ListItem
                            button
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                '& .MuiListItemIcon-root': {
                                    color: item.color
                                }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    </React.Fragment>
                ))}

                {/* 階層構造の表示 */}
                {types.map((type) => (
                    <React.Fragment key={type.id}>
                        <ListItem button onClick={() => handleTypeClick(type.id)}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                {getTypeIcon(type.name)}
                            </ListItemIcon>
                            <ListItemText primary={type.name} />
                            {openTypes[type.id] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openTypes[type.id]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {type.classifications?.map((classification) => (
                                    <React.Fragment key={classification.id}>
                                        <ListItem
                                            button
                                            sx={{ pl: 4 }}
                                            onClick={() => handleClassificationClick(classification.id)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                {getClassificationIcon(classification.name)}
                                            </ListItemIcon>
                                            <ListItemText primary={classification.name} />
                                            {classification.articles?.length > 0 && (
                                                openClassifications[classification.id] ? <ExpandLess /> : <ExpandMore />
                                            )}
                                        </ListItem>
                                        <Collapse in={openClassifications[classification.id]} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {classification.articles?.map((article) => (
                                                    <ListItem
                                                        button
                                                        key={article.id}
                                                        component={Link}
                                                        to={`/homepage/article/${article.id}`}
                                                        sx={{ pl: 6 }}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <FaBook style={{ fontSize: '0.8rem', opacity: 0.5 }} />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={article.title}
                                                            sx={{
                                                                '& .MuiTypography-root': {
                                                                    fontSize: '0.9rem'
                                                                }
                                                            }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Collapse>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ))}

                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={() => handleNavigate('/homepage/html_training')}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <FaHtml5 style={{ fontSize: '1.2rem', color: '#FF7043' }} />
                    </ListItemIcon>
                    <ListItemText primary="HTML/CSSトレーニング" />
                </ListItem>

                <ListItem button onClick={() => handleNavigate('/homepage/current_location')}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocationOnIcon style={{ fontSize: '1.2rem', color: '#FF7043' }} />
                    </ListItemIcon>
                    <ListItemText primary="天気、ネットワーク情報など" />
                </ListItem>

                {/* 3Dメニュー */}
                <ListItem button onClick={() => handleTypeClick('3d')}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <FaDesktop style={{ fontSize: '1.2rem', color: '#4DD0E1' }} />
                    </ListItemIcon>
                    <ListItemText primary="3D" />
                    {openTypes['3d'] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openTypes['3d']} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem
                            button
                            component={Link}
                            to="/homepage/3D/sky"
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <FaBook style={{ fontSize: '0.9rem', color: '#81C784' }} />
                            </ListItemIcon>
                            <ListItemText primary="空" />
                        </ListItem>
                    </List>
                </Collapse>

                <Divider sx={{ my: 2 }} />

                {/* 生産管理への切り替えボタン */}
                <ListItem
                    button
                    onClick={() => setSidebar("productionManagement")}
                    sx={{
                        mt: 1,
                        borderRadius: '10px',
                        transition: '0.2s ease-in-out',
                        background: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { background: 'rgba(180, 230, 255, 0.4)', transform: 'scale(1.02)' },
                    }}
                >
                    <ListItemIcon sx={{ color: '#666', opacity: 0.8 }}>
                        <FaCogs />
                    </ListItemIcon>
                    <ListItemText primary="生産管理" />
                </ListItem>

                {/* ログイン/ログアウトボタン */}
                <ListItem
                    button
                    onClick={isLoggedIn ? handleLogout : handleLogin}
                    sx={{
                        borderRadius: '10px',
                        transition: '0.2s ease-in-out',
                        background: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                            background: isLoggedIn
                                ? 'rgba(255, 100, 100, 0.1)'
                                : 'rgba(100, 255, 100, 0.1)',
                            transform: 'scale(1.02)'
                        },
                    }}
                >
                    <ListItemIcon sx={{
                        color: isLoggedIn ? '#f44336' : '#4CAF50',
                        opacity: 0.8
                    }}>
                        {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
                    </ListItemIcon>
                    <ListItemText
                        primary={isLoggedIn ? "ログアウト" : "ログイン"}
                        sx={{
                            color: isLoggedIn ? '#f44336' : '#4CAF50'
                        }}
                    />
                </ListItem>
            </List>
        </Drawer>
    );
}

HomepageSidebar.propTypes = {
    setToken: PropTypes.func.isRequired,
    setSidebar: PropTypes.func.isRequired,
    mobileOpen: PropTypes.bool,
    onClose: PropTypes.func,
    isMobile: PropTypes.bool,
    onLinkClick: PropTypes.func
};

export default HomepageSidebar;
