// pages/all/bulletin_board/BulletinBoardDetail.jsx

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
  Upload as UploadIcon,
  ErrorOutline as ErrorIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { API_BASE_URL } from '../../../config/baseURL';
import { successNoti, errorNoti } from '../../../utils/noti';

import '../../../CSS/index.css';

const BulletinBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bulletinData, setBulletinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // 更新関連の状態
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const tableContainerRef = useRef(null);

  // 画像ダイアログ関連の状態
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // 削除関連の状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setErrorDetail(null);

      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      // レスポンスの内容をテキストとして読み込み
      const responseText = await response.text();

      // ステータスコードに応じた処理
      if (!response.ok) {
        try {
          // JSONとしてパースを試みる
          const errorData = JSON.parse(responseText);
          setError(errorData.detail || `エラーが発生しました (${response.status})`);
          setErrorDetail(errorData);
        } catch (parseError) {
          // JSONパースに失敗した場合はテキストとして扱う
          setError(`エラーが発生しました: ${responseText} (${response.status})`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // 成功した場合はJSONとしてパース
      try {
        const data = JSON.parse(responseText);
        setBulletinData(data);
        console.log("取得したデータ:", data);
      } catch (parseError) {
        setError(`データの解析に失敗しました: ${parseError.message}`);
        throw parseError;
      }
    } catch (err) {
      console.error('掲示板詳細取得エラー:', err);
      if (!error) {
        // errorがまだ設定されていない場合（JSONパースエラーなど）
        setError(err.message);
      }
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
            try {
              const errorData = JSON.parse(text);
              throw new Error(errorData.detail || `ダウンロードに失敗しました (${response.status})`);
            } catch (parseError) {
              throw new Error(`ダウンロードに失敗しました: ${text} (${response.status})`);
            }
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

  // 画像クリック時のハンドラー
  const handleImageClick = (imageUri, index) => {
    setSelectedImage({ uri: imageUri, index });
    setImageDialogOpen(true);
  };

  // 画像ダイアログを閉じるハンドラー
  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
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

      const responseText = await response.text();

      if (!response.ok) {
        // 認証エラーの場合はログインページにリダイレクト
        if (response.status === 401) {
          errorNoti('認証期限が切れました。再ログインしてください。');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        if (response.status === 404) {
          errorNoti('更新用のエンドポイントが見つかりません。システム管理者に問い合わせてください。');
          return;
        }

        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.detail || `更新に失敗しました (${response.status})`);
        } catch (parseError) {
          throw new Error(`更新に失敗しました: ${responseText} (${response.status})`);
        }
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

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // 削除ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // 削除処理を実行
  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`${API_BASE_URL}/api/all/bulletin_board/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          errorNoti('認証期限が切れました。再ログインしてください。');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.detail || `削除に失敗しました (${response.status})`);
      }

      successNoti('掲示板が正常に削除されました');
      navigate('/all/bulletin_board/list');

    } catch (err) {
      console.error('削除エラー:', err);
      errorNoti(err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
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

  // 画像の位置を計算するための関数
  const calculateImagePosition = (image, column_dimensions, row_dimensions) => {
    if (!column_dimensions || !row_dimensions) {
      return { top: 0, left: 0, width: image.width || 100, height: image.height || 100 };
    }

    // 行の高さを累積して垂直位置を計算
    let yPos = 0;
    for (let r = 1; r < image.from_row; r++) {
      const rowHeight = row_dimensions[r] || 20; // デフォルト行高さを調整
      yPos += rowHeight;
    }

    // 列の幅を累積して水平位置を計算
    let xPos = 0;
    for (let c = 1; c < image.from_col; c++) {
      // Excelの列幅をピクセルに変換する係数を調整
      const colWidth = column_dimensions[c] || 8.43; // デフォルト列幅
      xPos += colWidth * 9; // 変換係数を調整
    }

    // 画像サイズの計算
    let width = image.width;
    let height = image.height;

    // 幅と高さが指定されていない場合は、セルのサイズから計算
    if (!width || !height) {
      // 画像が占めるセル範囲の幅を計算
      let cellWidth = 0;
      for (let c = image.from_col; c <= image.to_col; c++) {
        cellWidth += (column_dimensions[c] || 8.43) * 9; // 同じ変換係数を使用
      }

      // 画像が占めるセル範囲の高さを計算
      let cellHeight = 0;
      for (let r = image.from_row; r <= image.to_row; r++) {
        cellHeight += (row_dimensions[r] || 20); // デフォルト値を調整
      }

      width = cellWidth;
      height = cellHeight;
    }

    // NaNチェック
    width = isNaN(width) ? 100 : width;
    height = isNaN(height) ? 100 : height;

    return { top: yPos, left: xPos, width, height };
  };

  // 画像を表示する関数
  const renderImages = () => {
    if (!bulletinData || !bulletinData.images || bulletinData.images.length === 0) {
      return null;
    }

    return bulletinData.images.map((image, index) => {
      const position = calculateImagePosition(
        image,
        bulletinData.column_dimensions,
        bulletinData.row_dimensions
      );

      // デバッグ情報をコンソールに出力
      console.log(`画像 ${index} の位置計算:`, {
        image: {
          from_row: image.from_row,
          from_col: image.from_col,
          to_row: image.to_row,
          to_col: image.to_col,
          width: image.width,
          height: image.height
        },
        calculated: position
      });

      // データURIを構築
      let imageDataUri = '';
      try {
        if (image.image_data) {
          imageDataUri = `data:image/${image.image_type || 'png'};base64,${image.image_data}`;
        }
      } catch (e) {
        console.error('画像データURIの構築に失敗:', e);
      }

      return (
        <div
          key={`image-${index}`}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
            backgroundImage: `url(${imageDataUri})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            pointerEvents: 'auto',
            zIndex: 10,
            cursor: 'pointer'
          }}
          onClick={() => handleImageClick(imageDataUri, index)}
        />
      );
    });
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
                style={getCellStyle(cell, rowHeight, colWidth * 9)} // 変換係数を調整
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
                style={getCellStyle(cell, rowHeight, colWidth * 9)} // 変換係数を調整
                title={cell?.value || ''}
              >
                {renderCellContent(cell)}
              </td>
            );
          }
        }

        if (rowCells.length > 0) {
          rows.push(<tr key={r} style={{ height: `${row_dimensions[r] || 20}px` }}>{rowCells}</tr>); // デフォルト値を調整
        }
      }

      // 画像の高さを計算（テーブルコンテナの高さを決めるため）
      let maxImageBottom = 0;
      if (bulletinData.images && bulletinData.images.length > 0) {
        bulletinData.images.forEach(image => {
          const position = calculateImagePosition(
            image,
            bulletinData.column_dimensions,
            bulletinData.row_dimensions
          );
          const imageBottom = position.top + position.height;
          maxImageBottom = Math.max(maxImageBottom, imageBottom);
        });
      }

      // テーブルの高さを計算
      let tableHeight = 0;
      for (let r = 1; r <= maxRow; r++) {
        tableHeight += (row_dimensions[r] || 20); // デフォルト値を調整
      }

      // テーブルと画像のどちらか高い方をコンテナの高さとする
      const containerHeight = Math.max(tableHeight, maxImageBottom);

      return (
        <Box
          ref={tableContainerRef}
          sx={{
            position: 'relative',
            width: '100%',
            minHeight: containerHeight,
            overflow: 'hidden',
            mb: 3
          }}
        >
          {/* 画像レイヤー */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          >
            {renderImages()}
          </Box>
          {/* テーブルレイヤー */}
          <Box
            component="table"
            sx={{
              position: 'relative',
              borderCollapse: 'collapse',
              borderSpacing: 0,
              width: '100%',
              zIndex: 1,
              tableLayout: 'fixed'
            }}
          >
            <tbody>{rows}</tbody>
          </Box>
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

  const renderError = () => {
    if (!error) return null;

    // errorDetailがある場合は詳細情報を表示
    if (errorDetail) {
      return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" color="error">
              エラーが発生しました
            </Typography>
          </Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            この掲示板投稿は見つからないか、アクセス権限がありません。
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/all/bulletin_board/list')}
            sx={{ mt: 1 }}
          >
            一覧に戻る
          </Button>
        </Paper>
      );
    }

    // 一般的なエラー表示
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  };

  // bulletinDataのレンダリングを整理する関数
  const renderContent = () => {
    if (!bulletinData) return null;

    return (
      <>
        {/* 掲示板の基本情報 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography
            variant="h4"
          >
            {bulletinData.title}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
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

        {/* Excelシートの内容 */}
        <Paper sx={{
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>エクセルシート内容</Typography>
          {renderTable()}
        </Paper>
      </>
    );
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
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
              sx={{
                mb: 2,
                borderRadius: '8px',
                background: 'linear-gradient(to right, #e74c3c, #c0392b)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: 'linear-gradient(to right, #c0392b, #a93226)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              削除する
            </Button>
          </Box>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && renderError()}

      {!loading && bulletinData && renderContent()}

      {/* 画像拡大表示ダイアログ */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.03)', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedImage && (
            <img
              src={selectedImage.uri}
              alt={`画像 ${selectedImage.index + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} variant="contained" color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>投稿の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Box>
              この投稿を削除してもよろしいですか？
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            キャンセル
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : '削除する'}
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