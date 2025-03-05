import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/baseURL';

const Index = () => {
    const [latestArticles, setLatestArticles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLatestArticles = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/index`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLatestArticles(data.articles || []);
            } catch (error) {
                console.error('Error fetching latest articles:', error);
            }
        };

        fetchLatestArticles();
    }, []);

    if (!latestArticles || latestArticles.length === 0) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h4">最新の記事</Typography>
                <Typography>記事が見つかりませんでした。</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            padding: 3,
            width: '100%',  // 幅を100%に設定
            maxWidth: '1200px',  // 最大幅を設定
            margin: '0 auto',  // 中央寄せ
            marginTop: '20px'  // 上部にマージンを追加
        }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 'bold',
                    color: '#444',
                    marginBottom: 4,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    borderBottom: '2px solid #eee',
                    paddingBottom: 2
                }}
            >
                最新の記事
            </Typography>

            <Grid container spacing={3} sx={{ marginTop: 0 }}>  {/* marginTopを0に設定 */}
                {latestArticles.map((article) => (
                    <Grid item xs={12} sm={6} md={4} key={article.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%)',
                                borderRadius: '15px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => navigate(`/homepage/article/${article.id}`)}
                                sx={{ height: '100%' }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#666',
                                            display: 'block',
                                            marginBottom: 1
                                        }}
                                    >
                                        {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                                    </Typography>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#444',
                                            marginBottom: 1
                                        }}
                                    >
                                        {article.title}
                                    </Typography>

                                    {article.type_name && (
                                        <Box sx={{ display: 'flex', gap: 1, marginBottom: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                    color: '#2196F3',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {article.type_name}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Index;
