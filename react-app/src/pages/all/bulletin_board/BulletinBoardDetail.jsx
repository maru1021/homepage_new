// pages/all/BulletinBoardDetail.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { API_BASE_URL } from '../../../config/baseURL';
import { successNoti, errorNoti } from '../../../utils/noti';

const BulletinBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bulletinData, setBulletinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // 更新関連の状態
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBulletinDetail();
  }, [id]);

  // 更新ダイアログを開く時、現在の情報を設定
  useEffect(() => {
    if (bulletinData && updateDialogOpen) {
      setUpdateTitle(bulletinData.title);
      setUpdateContent(bulletinData.content || '');
    }
  }, [updateDialogOpen, bulletinData]);

  const fetchBulletinDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();
      setBulletinData(data);
    } catch (err) {
      console.error('掲示板詳細取得エラー:', err);
      setError(err.message);
      setNotification({
        open: true,
        message: `掲示板詳細の取得に失敗しました: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    try {
      setLoading(true);

      fetch(`${API_BASE_URL}/api/all/bulletin_board/download/${id}`, {
        method: 'GET',
        credentials: 'include',
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
        link.setAttribute('download', `${bulletinData.title || `bulletin_${id}`}.xlsx`);

        // リンクをクリックしてダウンロード
        document.body.appendChild(link);
        link.click();

        // 後処理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // メモリリーク防止のためにURLを解放

        setLoading(false);
      })
      .catch(err => {
        console.error('ダウンロードエラー:', err);
        errorNoti(err.message);
        setLoading(false);
      });

    } catch (err) {
      console.error('ダウンロード処理エラー:', err);
      errorNoti(err.message);
      setLoading(false);
    }
  };

  // 更新ダイアログを開く
  const handleOpenUpdateDialog = () => {
    setUpdateDialogOpen(true);
  };

  // 更新ダイアログを閉じる
  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedFile(null);
  };

  // ファイル選択ダイアログを開く
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  // ファイル選択時の処理
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイル拡張子の確認
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      errorNoti('アップロードできるのはExcel形式のファイル(.xlsx, .xls)のみです');
      return;
    }

    setSelectedFile(file);
  };

  // 更新処理を実行
  const handleUpdate = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', updateTitle);
      formData.append('content', updateContent);

      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/${id}/update`, {
        method: 'PUT',
        credentials: 'include',
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
        throw new Error(`更新に失敗しました: ${errorText}`);
      }

      // 更新成功後の処理
      successNoti('掲示板が正常に更新されました');

      setUpdateDialogOpen(false);
      setSelectedFile(null);

      // データを再取得
      fetchBulletinDetail();

    } catch (err) {
      console.error('更新エラー:', err);
      errorNoti(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  // ボーダースタイルを変換する関数
  const getBorderStyle = (border) => {
    if (!border || !border.style || border.style === 'none') return 'none';

    const styleMap = {
      'thin': '1px solid',
      'medium': '2px solid',
      'thick': '3px solid',
      'dashed': '1px dashed',
      'dotted': '1px dotted',
      'double': '3px double',
    };

    return styleMap[border.style] || 'none';
  };

  // 色コードをRGBA形式に変換
  const convertColor = (colorCode) => {
    if (!colorCode) return 'transparent';

    if (typeof colorCode !== 'string') {
      console.warn('無効な色コード:', colorCode);
      return 'transparent';
    }

    if (colorCode === '00000000') return 'transparent';

    try {
      if (colorCode.length === 8) {
        const a = parseInt(colorCode.slice(0, 2), 16) / 255;
        const r = parseInt(colorCode.slice(2, 4), 16);
        const g = parseInt(colorCode.slice(4, 6), 16);
        const b = parseInt(colorCode.slice(6, 8), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }

      if (colorCode.startsWith('FF') && colorCode.length === 8) {
        return `#${colorCode.slice(2)}`;
      }

      return `#${colorCode.slice(2)}`;
    } catch (e) {
      console.warn('色コード変換エラー:', e, colorCode);
      return 'transparent';
    }
  };

  // セルスタイルを生成
  const getCellStyle = (cell, rowHeight, colWidth) => {
    if (!cell) return {};

    const style = cell.style || {};
    const borderStyle = {
      borderTop: getBorderStyle(style.border?.top),
      borderRight: getBorderStyle(style.border?.right),
      borderBottom: getBorderStyle(style.border?.bottom),
      borderLeft: getBorderStyle(style.border?.left),
      borderTopColor: style.border?.top?.color ? convertColor(style.border.top.color) : null,
      borderRightColor: style.border?.right?.color ? convertColor(style.border.right.color) : null,
      borderBottomColor: style.border?.bottom?.color ? convertColor(style.border.bottom.color) : null,
      borderLeftColor: style.border?.left?.color ? convertColor(style.border.left.color) : null,
    };

    return {
      fontSize: style.font?.size ? `${style.font.size}pt` : 'inherit',
      fontWeight: style.font?.bold ? 'bold' : 'normal',
      color: style.font?.color ? convertColor(style.font.color) : 'black',
      backgroundColor: style.fill?.bgColor ? convertColor(style.fill.bgColor) : 'transparent',
      ...borderStyle,
      textAlign: style.alignment?.horizontal || 'left',
      verticalAlign: style.alignment?.vertical || 'middle',
      height: rowHeight ? `${rowHeight}px` : 'auto',
      width: colWidth ? `${colWidth}px` : 'auto',
      padding: '4px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
  };

  // 結合セルをチェック
  const isMergedCell = (row, col, merges) => {
    for (const merge of merges || []) {
      const { start, end } = merge;
      if (row >= start.row && row <= end.row && col >= start.col && col <= end.col) {
        return {
          isMain: row === start.row && col === start.col,
          rowSpan: end.row - start.row + 1,
          colSpan: end.col - start.col + 1,
          start,
          end
        };
      }
    }
    return { isMain: false };
  };

  // セルを取得
  const getCell = (row, col, cells) => {
    return cells?.find(cell => cell.row === row && cell.col === col);
  };

  // テーブルのセルコンテンツを表示
  const renderCellContent = (cell) => {
    if (!cell || !cell.value) return '';

    const value = typeof cell.value === 'string' ? cell.value : String(cell.value);

    return value;
  };

  // 表を生成
  const renderTable = () => {
    if (!bulletinData) return null;

    const { cells, merges, column_dimensions, row_dimensions } = bulletinData;

    if (!cells || cells.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography>セルデータが見つかりません。</Typography>
        </Box>
      );
    }

    try {
      // 最大行数と列数を取得
      const maxRow = Math.max(...cells.map(cell => cell.row), 0);
      const maxCol = Math.max(...cells.map(cell => cell.col), 0);

      const rows = [];

      for (let r = 1; r <= maxRow; r++) {
        const rowCells = [];
        for (let c = 1; c <= maxCol; c++) {
          const cell = getCell(r, c, cells);
          const mergeInfo = isMergedCell(r, c, merges);

          // 結合セルの中心セル以外はスキップ
          if (mergeInfo.isMain) {
            const rowHeight = row_dimensions[r];
            const colWidth = column_dimensions[c];

            rowCells.push(
              <td
                key={`${r}-${c}`}
                rowSpan={mergeInfo.rowSpan}
                colSpan={mergeInfo.colSpan}
                style={getCellStyle(cell, rowHeight, colWidth * 7)}
                title={cell?.value || ''}
              >
                {renderCellContent(cell)}
              </td>
            );
          } else if (!mergeInfo.isMain && !mergeInfo.start) {
            // 結合セルでない通常のセル
            const rowHeight = row_dimensions[r];
            const colWidth = column_dimensions[c];

            rowCells.push(
              <td
                key={`${r}-${c}`}
                style={getCellStyle(cell, rowHeight, colWidth * 7)}
                title={cell?.value || ''}
              >
                {renderCellContent(cell)}
              </td>
            );
          }
        }

        if (rowCells.length > 0) {
          rows.push(<tr key={r} style={{ height: `${row_dimensions[r]}px` }}>{rowCells}</tr>);
        }
      }

      return (
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <table style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
            <tbody>{rows}</tbody>
          </table>
        </Box>
      );
    } catch (err) {
      console.error('テーブルレンダリングエラー:', err);
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          データの表示中にエラーが発生しました: {err.message}
        </Alert>
      );
    }
  };

  return (
    <Box className="BulletinBoardDetail">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/all/bulletin_board/list')}
          sx={{ mb: 2 }}
        >
          一覧に戻る
        </Button>

        {bulletinData && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleOpenUpdateDialog}
            sx={{
              mb: 2,
              borderRadius: '8px',
              background: 'linear-gradient(to right, #9b59b6, #8e44ad)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: 'linear-gradient(to right, #8e44ad, #7d3c98)',
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            更新する
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && bulletinData && (
        <>
          <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c3e50',
                position: 'relative',
                paddingBottom: 2,
                marginBottom: 2,
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
              {bulletinData.title}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  投稿者: {bulletinData.employee_name || `ユーザーID: ${bulletinData.employee_id}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  投稿日時: {formatDate(bulletinData.created_at)}
                </Typography>
              </Grid>
            </Grid>

            {bulletinData.content && (
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {bulletinData.content}
                </Typography>
              </Box>
            )}

            {bulletinData.filename && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Chip
                  label={bulletinData.filename}
                  variant="outlined"
                  sx={{ mr: 2, borderColor: 'rgba(46, 204, 113, 0.3)', color: 'rgba(46, 204, 113, 0.8)' }}
                />
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadExcel}
                  sx={{ borderRadius: '8px' }}
                >
                  Excelダウンロード
                </Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>エクセルシート内容</Typography>
            {renderTable()}
          </Paper>
        </>
      )}

      {/* 更新ダイアログ */}
      <Dialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>掲示板の更新</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            更新したい内容とExcelファイルをアップロードしてください。
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="タイトル"
            type="text"
            fullWidth
            variant="outlined"
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            margin="dense"
            id="content"
            label="説明（任意）"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            border: '2px dashed #e0e0e0',
            borderRadius: '8px'
          }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleFileInputClick}
              sx={{ mb: 2 }}
            >
              Excelファイルを選択
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                選択されたファイル: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog} disabled={uploading}>
            キャンセル
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="primary"
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : '更新する'}
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

export default BulletinBoardDetail;