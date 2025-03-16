import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { API_BASE_URL } from '../../../config/baseURL';

const BulletinBoardList = () => {
  const navigate = useNavigate();
  const [bulletinPosts, setBulletinPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 検索ワード用のステート

  // 月の選択肢を生成（現在から過去12ヶ月）
  const months = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = subMonths(currentDate, i);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'yyyy年MM月', { locale: ja });
    months.push({ key: monthKey, label: monthLabel, date });
  }

  // 初期表示時にデータをロード
  useEffect(() => {
    fetchBulletinPosts();
  }, [page]);

  // 選択した月と検索ワードに応じてデータをフィルタリング
  useEffect(() => {
    filterPosts();
  }, [selectedMonth, bulletinPosts, searchTerm]);

  // 掲示板投稿を取得
  const fetchBulletinPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/list?skip=${(page - 1) * 10}&limit=100`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('認証期限が切れました。再ログインしてください。');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setBulletinPosts(data.posts);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (err) {
      console.error('掲示板リスト取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 月と検索ワードによるフィルタリング
  const filterPosts = () => {
    if (!bulletinPosts.length) {
      setFilteredPosts([]);
      return;
    }

    // まず月でフィルタリング
    let monthFiltered = [];
    if (selectedMonth === 'current') {
      // 現在の月の投稿を表示（最新1ヶ月）
      const oneMonthAgo = subMonths(new Date(), 1);
      monthFiltered = bulletinPosts.filter(post => {
        const postDate = parseISO(post.created_at);
        return postDate >= oneMonthAgo;
      });
    } else if (selectedMonth === 'all') {
      // すべての投稿を表示
      monthFiltered = bulletinPosts;
    } else {
      // 特定の月の投稿を表示
      const selectedDate = months.find(month => month.key === selectedMonth)?.date || new Date();
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      monthFiltered = bulletinPosts.filter(post => {
        const postDate = parseISO(post.created_at);
        return isWithinInterval(postDate, { start: startDate, end: endDate });
      });
    }

    // 続いて検索ワードでフィルタリング
    if (searchTerm.trim() === '') {
      setFilteredPosts(monthFiltered);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const searchFiltered = monthFiltered.filter(post => {
        // タイトルで検索
        const titleMatch = post.title && post.title.toLowerCase().includes(searchTermLower);
        // 内容で検索
        const contentMatch = post.content && post.content.toLowerCase().includes(searchTermLower);
        // ファイル名で検索
        const filenameMatch = post.filename && post.filename.toLowerCase().includes(searchTermLower);
        // 投稿者名で検索
        const employeeNameMatch = post.employee_name && post.employee_name.toLowerCase().includes(searchTermLower);

        return titleMatch || contentMatch || filenameMatch || employeeNameMatch;
      });
      setFilteredPosts(searchFiltered);
    }
  };

  // 日付フォーマット
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };

  // 詳細ページに遷移
  const handleViewDetail = (id) => {
    navigate(`/all/bulletin_board/${id}`);
  };

  // ファイルをダウンロード
  const handleDownload = (event, id, title) => {
    // イベントの伝播を停止して、カードクリックのハンドラが発火しないようにする
    event.stopPropagation();

    try {
      // fetch APIを使用して認証情報を含めたリクエストを送信
      fetch(`${API_BASE_URL}/api/all/bulletin_board/download/${id}`, {
        method: 'GET',
        credentials: 'include', // 認証クッキーを含める
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`ダウンロードに失敗しました: ${text}`);
          });
        }
        return response.blob(); // レスポンスをBlobとして取得
      })
      .then(blob => {
        // BlobからオブジェクトURLを作成
        const url = window.URL.createObjectURL(blob);

        // ダウンロードリンクを作成
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title || `bulletin_${id}`}.xlsx`);

        // リンクをクリックしてダウンロード
        document.body.appendChild(link);
        link.click();

        // 後処理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // メモリリーク防止のためにURLを解放

        setNotification({
          open: true,
          message: 'ダウンロードを開始しました',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('ダウンロードエラー:', err);
        setNotification({
          open: true,
          message: err.message,
          severity: 'error'
        });
      });
    } catch (err) {
      console.error('ダウンロード処理エラー:', err);
      setNotification({
        open: true,
        message: `ダウンロード処理中にエラーが発生しました: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // 新規投稿ページに遷移
  const handleCreateNew = () => {
    navigate('/all/bulletin_board/register');
  };

  // 月選択の変更ハンドラ
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // 検索ワード変更ハンドラ
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 通知を閉じる
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // ページ変更ハンドラ
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box className="BulletinBoardList">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#2c3e50',
            position: 'relative',
            paddingBottom: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '80px',
              height: '3px',
              backgroundColor: '#3498db',
            }
          }}
        >
          掲示板一覧
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            borderRadius: '8px',
            background: 'linear-gradient(to right, #4caf50, #45a049)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(to right, #45a049, #3d8b40)',
            },
          }}
        >
          新規投稿
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: '10px' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
          {/* 期間絞り込み */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle1" sx={{ mr: 2, whiteSpace: 'nowrap' }}>期間で絞り込み：</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="month-select-label">表示期間</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={selectedMonth}
                label="表示期間"
                onChange={handleMonthChange}
                size="small"
              >
                <MenuItem value="current">最新1ヶ月</MenuItem>
                <MenuItem value="all">すべて表示</MenuItem>
                <Divider />
                {months.map((month) => (
                  <MenuItem key={month.key} value={month.key}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 検索欄 */}
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              placeholder="タイトル、内容、ファイル名で検索..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && filteredPosts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            表示する投稿がありません
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? '検索条件を変更するか、' : ''}新しい投稿を作成するか、別の期間を選択してください
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredPosts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                  cursor: 'pointer', // カードにホバーした時にカーソルをポインターに変更
                },
              }}
              onClick={() => handleViewDetail(post.id)} // カード全体をクリックで詳細ページへ遷移
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    height: '3.6em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {post.employee_name || `社員ID: ${post.employee_id}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(post.created_at)}
                  </Typography>
                </Box>
                {post.content && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      height: '4.5em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {post.content}
                  </Typography>
                )}
                {post.filename && (
                  <Chip
                    label={post.filename}
                    size="small"
                    variant="outlined"
                    icon={<DescriptionIcon fontSize="small" />}
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => handleDownload(e, post.id, post.title)}
                  title="Excelダウンロード"
                >
                  <DownloadIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPosts.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulletinBoardList;