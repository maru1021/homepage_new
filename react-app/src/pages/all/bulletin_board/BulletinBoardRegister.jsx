import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { UploadFile as UploadFileIcon, Send as SendIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../../../config/baseURL';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/auth';

import { successNoti, errorNoti } from '../../../utils/noti';

const BulletinBoardRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ファイル名を表示するための状態
  const [fileName, setFileName] = useState('');

  // 現在のユーザー情報
  const [currentUser, setCurrentUser] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // AuthServiceから現在のユーザー情報を取得
    const userInfo = AuthService.getCurrentUser();
    setCurrentUser(userInfo);
  }, []);

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイル拡張子の確認
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('アップロードできるのはExcel形式のファイル(.xlsx, .xls)のみです');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    // ファイル名をタイトルの初期値として設定（タイトルが空の場合のみ）
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // 拡張子を除去
    }

    setNotification({
      open: true,
      message: `ファイル「${file.name}」が選択されました`,
      severity: 'success'
    });
  };

  const handleSubmitDialogOpen = () => {
    if (!title.trim()) {
      setNotification({
        open: true,
        message: 'タイトルを入力してください',
        severity: 'error'
      });
      return;
    }

    if (!selectedFile) {
      errorNoti('Excelファイルをアップロードしてください');
      return;
    }

    setSubmitDialogOpen(true);
  };

  const handleSubmitDialogClose = () => {
    setSubmitDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('content', content);
      // employee_idはサーバー側でCookieから取得するため省略

      // credentials: 'include'を追加してCookieを送信
      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/upload-excel`, {
        method: 'POST',
        credentials: 'include', // クッキーを含める
        body: formData,
      });

      if (!response.ok) {
        // 認証エラーの場合はログインページにリダイレクト
        if (response.status === 401) {
          errorNoti('認証期限が切れました。再ログインしてください。');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const errorText = await response.text();
        console.error('アップロードエラー:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      successNoti(`掲示板への投稿が完了しました`);

      setSubmitDialogOpen(false);

      // 投稿完了後、掲示板詳細画面へ遷移
      setTimeout(() => {
        navigate(`/all/bulletin_board/${data.id}`);
      }, 1500);

    } catch (err) {
      console.error('投稿エラー:', err);
      setError(`投稿に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box className="TableWithActions">
      <Box component="header">
        <Grid container alignItems="center" spacing={1} sx={{ paddingY: 1 }}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c3e50',
                marginTop: -1,
                marginBottom: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
                borderBottom: '2px solid #edf2f7',
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
                },
              }}
            >
              掲示板投稿作成
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ p: 3, mt: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="タイトル"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="投稿のタイトルを入力してください"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="説明（任意）"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="投稿の説明や補足情報を入力してください"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{
              p: 3,
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2
            }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<UploadFileIcon />}
                onClick={handleFileInputClick}
                sx={{
                  background: 'linear-gradient(to right, #f3a683, #f89466)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 10px rgba(255, 180, 180, 0.4)',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(to right, #f39569, #f57b40)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Excelファイルをアップロード
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {fileName && (
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                  選択されたファイル: {fileName}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSubmitDialogOpen}
              disabled={!selectedFile || !title.trim() || loading}
              sx={{
                borderRadius: '12px',
                padding: '10px 40px',
                fontWeight: 'bold',
                boxShadow: '4px 4px 10px rgba(52, 152, 219, 0.3)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '4px 4px 15px rgba(52, 152, 219, 0.4)',
                },
              }}
            >
              投稿を送信
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* 投稿確認ダイアログ */}
      <Dialog
        open={submitDialogOpen}
        onClose={handleSubmitDialogClose}
      >
        <DialogTitle>投稿の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            以下の内容で掲示板に投稿しますか？
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">タイトル:</Typography>
            <Typography paragraph>{title}</Typography>

            {content && (
              <>
                <Typography variant="subtitle2" fontWeight="bold">説明:</Typography>
                <Typography paragraph>{content}</Typography>
              </>
            )}

            <Typography variant="subtitle2" fontWeight="bold">ファイル:</Typography>
            <Typography>{selectedFile?.name}</Typography>

            {currentUser && (
              <>
                <Typography variant="subtitle2" fontWeight="bold">投稿者:</Typography>
                <Typography>{currentUser.name || '認証済みユーザー'}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmitDialogClose} color="inherit">キャンセル</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? '送信中...' : '投稿する'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default BulletinBoardRegister;