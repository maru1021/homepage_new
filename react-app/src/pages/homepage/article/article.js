import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip, Tabs, Tab, TextField, Button } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_BASE_URL } from '../../../index/basicTableModules';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import { ContextMenu } from '../../../index/basicTableModules';
import PropTypes from 'prop-types';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import handleAPI from '../../../utils/handleAPI';

const EditField = ({ value, onChange, onSave, multiline = false }) => (
    <Box>
        <TextField
            fullWidth
            multiline={multiline}
            value={value}
            onChange={onChange}
            autoFocus
            minRows={multiline ? 4 : 1}
            sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="contained"
                startIcon={<FaSave />}
                onClick={onSave}
                sx={{
                    background: 'linear-gradient(to right, #4CAF50, #45a049)',
                    '&:hover': {
                        background: 'linear-gradient(to right, #45a049, #3d8b40)'
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

EditField.defaultProps = {
    multiline: false
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

    const url = `${API_BASE_URL}/homepage/article/${id}`

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
                    setEditedContent(data.article);
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
            const response = await fetch(`${API_BASE_URL}/homepage/article/${id}`, {
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
        return <Box sx={{ p: 3 }}>Loading...</Box>;
    }

    // タブの内容を生成（explanationを除外）
    const tabs = [];
    if (article.disp) tabs.push({ label: '表示', content: article.disp });
    if (article.code) tabs.push({ label: article.language || 'コード1', content: article.code });
    if (article.code2) tabs.push({ label: article.language2 || 'コード2', content: article.code2 });
    if (article.code3) tabs.push({ label: article.language3 || 'コード3', content: article.code3 });

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)',
                    borderRadius: '15px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                        {article.title}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                        label={article.type_name}
                        sx={{
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            color: '#2196F3',
                            fontWeight: 'bold'
                        }}
                    />
                    <Chip
                        label={article.classification_name}
                        sx={{
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            color: '#9C27B0',
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                <Typography variant="caption" sx={{ color: '#666' }}>
                    最終更新: {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                </Typography>
            </Paper>

            {/* タブを含むPaperを条件付きで表示 */}
            {tabs.length > 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{
                            mb: 3,
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 'bold',
                                color: '#666',
                                '&.Mui-selected': {
                                    color: '#2196F3'
                                }
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>

                    {tabs.map((tab, index) => (
                        <Box
                            key={index}
                            role="tabpanel"
                            hidden={currentTab !== index}
                            sx={{ mt: 2 }}
                            onContextMenu={(e) => handleContextMenu(e, tab.label === '表示' ? 'disp' : `code${index || ''}`)}
                        >
                            {currentTab === index && (
                                tab.label === '表示' ? (
                                    editMode.disp ? (
                                        <EditField
                                            value={editedContent.disp}
                                            onChange={(e) => setEditedContent(prev => ({ ...prev, disp: e.target.value }))}
                                            onSave={() => handleSave('disp')}
                                            multiline
                                        />
                                    ) : (
                                        <Typography
                                            variant="body1"
                                            component="div"
                                            dangerouslySetInnerHTML={{ __html: tab.content }}
                                        />
                                    )
                                ) : (
                                    editMode[`code${index || ''}`] ? (
                                        <EditField
                                            value={editedContent[`code${index || ''}`]}
                                            onChange={(e) => setEditedContent(prev => ({
                                                ...prev,
                                                [`code${index || ''}`]: e.target.value
                                            }))}
                                            onSave={() => handleSave(`code${index || ''}`)}
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
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                {tab.content}
                                            </SyntaxHighlighter>
                                        </Box>
                                    )
                                )
                            )}
                        </Box>
                    ))}
                </Paper>
            )}

            {/* 説明 */}
            {article.explanation && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                    }}
                    onContextMenu={(e) => handleContextMenu(e, 'explanation')}
                >
                    <Typography variant="h6" sx={{ color: '#444', mb: 2 }}>
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
