import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, 
    CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/baseURL';
import LoadingAnimation from '../../components/LoadingAnimation';


const Index = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/index`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setArticles(data.articles || []);
            } catch (error) {
                console.error('Error fetching latest articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, []);

    return (
        <Box sx={{
            padding: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: '20px'
        }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    marginBottom: 4,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
                    borderBottom: '2px solid #edf2f7',
                    paddingBottom: 2,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        width: '100px',
                        height: '2px',
                        backgroundColor: '#3498db',
                        transition: 'width 0.3s ease'
                    }
                }}
            >
                最新の記事
            </Typography>

            {isLoading ? (
                <LoadingAnimation loadingText="記事を読み込んでいます..." />
            ) : articles.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    padding: 4,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '16px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <Typography variant="h6" color="text.secondary">
                        記事が見つかりませんでした
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ marginTop: 0 }}>
                    {articles.map((article) => (
                        <Grid item xs={12} sm={6} md={4} key={article.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                borderRadius: '16px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.02)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)'
                                }
                            }}>
                                <CardActionArea
                                    onClick={() => navigate(`/homepage/article/${article.id}`)}
                                    sx={{ height: '100%', p: 0.5 }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#94a3b8',
                                                display: 'block',
                                                marginBottom: 1.5,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                marginBottom: 2,
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {article.title}
                                        </Typography>

                                        {(article.type_name || article.classification_name) && (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                gap: 1,
                                                flexWrap: 'wrap'  // タグが長い場合に折り返し
                                            }}>
                                                {article.type_name && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6',
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            letterSpacing: '0.02em',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {article.type_name}
                                                    </Typography>
                                                )}
                                                {article.classification_name && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',  // 異なる色を使用
                                                            color: '#10b981',  // 異なる色を使用
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            letterSpacing: '0.02em',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {article.classification_name}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Index;
