import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip, Tabs, Tab, TextField, Button } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_BASE_URL } from '../../../config/baseURL';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import { ContextMenu } from '../../../index/basicTableModules';
import PropTypes from 'prop-types';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import handleAPI from '../../../utils/handleAPI';
import LoadingAnimation from '../../../components/LoadingAnimation';


const EditField = ({ value, onChange, onSave, multiline = false }) => (
    <Box>
        <TextField
            fullWidth
            multiline={multiline}
            value={value}
            onChange={onChange}
            autoFocus
            minRows={multiline ? 4 : 1}
            sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                }
            }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="contained"
                startIcon={<FaSave />}
                onClick={onSave}
                sx={{
                    borderRadius: '12px',
                    padding: '8px 24px',
                    background: 'linear-gradient(45deg, #3498db, #2980b9)',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #2980b9, #2573a7)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(52, 152, 219, 0.4)'
                    }
                }}
            >
                保存
            </Button>
        </Box>
    </Box>
);

EditField.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    multiline: PropTypes.bool
};

// テキストの改行とタブを適切に変換する関数（コード用）
const formatText = (text) => {
    if (!text) return '';
    return text
        .replace(/\\n/g, '\n')  // バックスラッシュ付きの改行を実際の改行に変換
        .replace(/\\t/g, '    ');  // タブをスペース4つに変換
};

// 表示用テキストの改行を処理する関数
const formatDisplayText = (text) => {
    if (!text) return '';
    return text
        .replace(/\\n/g, '<br />')  // バックスラッシュ付きの改行をHTMLの改行タグに変換
        .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');  // タブをスペースに変換
};

const Article = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [editMode, setEditMode] = useState({
        title: false,
        disp: false,
        code: false,
        code2: false,
        code3: false,
        explanation: false
    });
    const [editedContent, setEditedContent] = useState({});

    const url = `${API_BASE_URL}/public/article/${id}`

    // コンテキストメニュー用の状態
    const [menuPosition, setMenuPosition] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const menuRef = React.useRef(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`${url}`);
                if (response.ok) {
                    const data = await response.json();
                    setArticle(data.article);
                    setEditedContent({
                        title: data.article.title,
                        disp: data.article.disp,
                        code: data.article.code,
                        code2: data.article.code2,
                        code3: data.article.code3,
                        explanation: data.article.explanation
                    });
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        fetchArticle();
    }, [id]);

    const handleContextMenu = (event, field) => {
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setSelectedField(field);
    };

    const handleEdit = () => {
        setEditMode(prev => ({ ...prev, [selectedField]: true }));
        setMenuPosition(null);
    };

    const handleSave = async (field) => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/article/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    [field]: editedContent[field]
                })
            });

            if (response.ok) {
                setArticle(prev => ({ ...prev, [field]: editedContent[field] }));
                setEditMode(prev => ({ ...prev, [field]: false }));
            }
        } catch (error) {
            console.error('Error updating article:', error);
        }
    };

    const handleDelete = async () => {
        setMenuPosition(null);
        const confirmed = await ConfirmDeleteModal.call({
            message: `${article.title}を削除してもよろしいですか？`
        });

        if (confirmed) {
            await handleAPI(url, 'DELETE', () => navigate('/'))
        }
    };

    const contextMenuActions = [
        { label: '編集', icon: <FaEdit color='#82B1FF' />, onClick: handleEdit },
        {
            label: '削除',
            icon: <FaTrash color='#FF5252' />,
            onClick: handleDelete,
            divider: true
        }
    ];

    if (!article) {
        return <LoadingAnimation loadingText='記事を読み込んでいます...' />;
    }

    // タブの内容を生成時にfieldプロパティを追加
    const tabs = [];
    if (article.disp) tabs.push({ label: '表示', content: article.disp, field: 'disp' });
    if (article.code) tabs.push({ label: article.language || 'コード1', content: article.code, field: 'code' });
    if (article.code2) tabs.push({ label: article.language2 || 'コード2', content: article.code2, field: 'code2' });
    if (article.code3) tabs.push({ label: article.language3 || 'コード3', content: article.code3, field: 'code3' });

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(240,240,240,0.4) 100%)'
        }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 12px 48px rgba(0,0,0,0.08)'
                    }
                }}
                onContextMenu={(e) => handleContextMenu(e, 'title')}
            >
                {editMode.title ? (
                    <EditField
                        value={editedContent.title}
                        onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                        onSave={() => handleSave('title')}
                    />
                ) : (
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            color: '#1a202c',
                            mb: 3,
                            lineHeight: 1.3,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {article.title}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                    {article.type_name && (
                        <Chip
                            label={article.type_name}
                            sx={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                fontWeight: 600,
                                borderRadius: '12px',
                                padding: '4px 8px',
                                '&:hover': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.15)'
                                }
                            }}
                        />
                    )}
                    {article.classification_name && (
                        <Chip
                            label={article.classification_name}
                            sx={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                fontWeight: 600,
                                borderRadius: '12px',
                                padding: '4px 8px',
                                '&:hover': {
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)'
                                }
                            }}
                        />
                    )}
                </Box>

                <Typography
                    variant="caption"
                    sx={{
                        color: '#64748b',
                        display: 'block',
                        fontSize: '0.875rem'
                    }}
                >
                    最終更新: {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                </Typography>
            </Paper>

            {/* タブを含むPaper */}
            {tabs.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                        overflow: 'hidden'
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 3,
                            borderBottom: '2px solid #edf2f7',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#64748b',
                                minWidth: 120,
                                '&.Mui-selected': {
                                    color: '#3b82f6'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#3b82f6',
                                height: '3px',
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab 
                                key={index} 
                                label={tab.label}
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        color: '#3b82f6',
                                        backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                    }
                                }}
                            />
                        ))}
                    </Tabs>

                    {tabs.map((tab, index) => (
                        <Box
                            key={index}
                            role="tabpanel"
                            hidden={currentTab !== index}
                            sx={{ mt: 2 }}
                            onContextMenu={(e) => handleContextMenu(e, tab.field)}
                        >
                            {currentTab === index && (
                                tab.label === '表示' ? (
                                    editMode.disp ? (
                                        <EditField
                                            value={editedContent.disp || ''}
                                            onChange={(e) => setEditedContent(prev => ({ ...prev, disp: e.target.value }))}
                                            onSave={() => handleSave('disp')}
                                            multiline
                                        />
                                    ) : (
                                        <Typography
                                            variant="body1"
                                            component="div"
                                            sx={{
                                                color: '#1a202c',
                                                lineHeight: 1.8,
                                                '& code': {
                                                    backgroundColor: 'rgba(45, 55, 72, 0.1)',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    fontFamily: 'monospace'
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: formatDisplayText(tab.content) }}
                                        />
                                    )
                                ) : (
                                    editMode[tab.field] ? (
                                        <EditField
                                            value={editedContent[tab.field] || ''}
                                            onChange={(e) => setEditedContent(prev => ({
                                                ...prev,
                                                [tab.field]: e.target.value
                                            }))}
                                            onSave={() => handleSave(tab.field)}
                                            multiline
                                        />
                                    ) : (
                                        <Box sx={{ backgroundColor: '#2d2d2d', borderRadius: '10px', p: '4px' }}>
                                            <SyntaxHighlighter
                                                language={article[`language${index > 0 ? index : ''}`]?.toLowerCase()}
                                                style={tomorrow}
                                                customStyle={{
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    margin: '0',
                                                    backgroundColor: 'transparent',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {formatText(tab.content)}
                                            </SyntaxHighlighter>
                                        </Box>
                                    )
                                )
                            )}
                        </Box>
                    ))}
                </Paper>
            )}

            {/* 説明セクション */}
            {article.explanation && (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
                    }}
                    onContextMenu={(e) => handleContextMenu(e, 'explanation')}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#1a202c',
                            mb: 3,
                            fontWeight: 600,
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: 0,
                                width: 40,
                                height: 3,
                                backgroundColor: '#3b82f6',
                                borderRadius: '3px'
                            }
                        }}
                    >
                        説明
                    </Typography>
                    {editMode.explanation ? (
                        <EditField
                            value={editedContent.explanation}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, explanation: e.target.value }))}
                            onSave={() => handleSave('explanation')}
                            multiline
                        />
                    ) : (
                        <Typography
                            variant="body1"
                            component="div"
                            dangerouslySetInnerHTML={{ __html: article.explanation }}
                        />
                    )}
                </Paper>
            )}

            {menuPosition && (
                <ContextMenu
                    position={menuPosition}
                    actions={contextMenuActions}
                    menuRef={menuRef}
                />
            )}
        </Box>
    );
};

export default Article;
