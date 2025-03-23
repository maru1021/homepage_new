import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { API_BASE_URL } from '../../../config/baseURL';

const ArticleNew = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        disp: '',
        language: '',
        code: '',
        language2: '',
        code2: '',
        language3: '',
        code3: '',
        explanation: '',
        type_id: '',
        classification_id: ''
    });
    const [types, setTypes] = useState([]);
    const [classifications, setClassifications] = useState([]);

    // 項目と分類のデータを取得
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/side_bar`);
                if (response.ok) {
                    const data = await response.json();
                    setTypes(data.types || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/public/article/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                navigate(`/homepage/article/${data.article.id}`);
            }
        } catch (error) {
            console.error('Error creating article:', error);
        }
    };

    const tabs = [
        { label: '表示', field: 'disp' },
        { label: 'コード1', field: 'code', languageField: 'language' },
        { label: 'コード2', field: 'code2', languageField: 'language2' },
        { label: 'コード3', field: 'code3', languageField: 'language3' }
    ];

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            {/* タイトルと分類選択 */}
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
                <Typography variant="h4">
                    新規記事作成
                </Typography>

                <TextField
                    fullWidth
                    label="タイトル"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    sx={{ mb: 2, mt: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>項目</InputLabel>
                        <Select
                            value={formData.type_id}
                            label="項目"
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    type_id: e.target.value,
                                    classification_id: ''  // 項目が変更されたら分類をリセット
                                }));
                                const selectedType = types.find(t => t.id === e.target.value);
                                setClassifications(selectedType?.classifications || []);
                            }}
                        >
                            {types.map(type => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>分類</InputLabel>
                        <Select
                            value={formData.classification_id}
                            label="分類"
                            onChange={(e) => setFormData(prev => ({ ...prev, classification_id: e.target.value }))}
                        >
                            {classifications.map(classification => (
                                <MenuItem key={classification.id} value={classification.id}>
                                    {classification.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* タブ付きコンテンツ */}
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
                    {tabs.map((tab) => (
                        <Tab key={tab.label} label={tab.label} />
                    ))}
                </Tabs>

                {tabs.map((tab, index) => (
                    <Box
                        key={index}
                        role="tabpanel"
                        hidden={currentTab !== index}
                        sx={{ mt: 2 }}
                    >
                        {currentTab === index && (
                            <Box>
                                {tab.languageField && (
                                    <TextField
                                        fullWidth
                                        label="言語"
                                        value={formData[tab.languageField]}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            [tab.languageField]: e.target.value
                                        }))}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label={tab.label}
                                    value={formData[tab.field]}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [tab.field]: e.target.value
                                    }))}
                                />
                            </Box>
                        )}
                    </Box>
                ))}
            </Paper>

            {/* 説明欄 */}
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
                <Typography variant="h6" sx={{ color: '#444', mb: 2 }}>
                    説明
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                />
            </Paper>

            {/* 保存ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(to right, #4CAF50, #45a049)',
                        '&:hover': {
                            background: 'linear-gradient(to right, #45a049, #3d8b40)'
                        }
                    }}
                >
                    記事を作成
                </Button>
            </Box>
        </Box>
    );
};

export default ArticleNew;
