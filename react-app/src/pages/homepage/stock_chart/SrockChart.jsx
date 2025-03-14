import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Select, MenuItem, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';

import CandlestickChart from './CandlestickChart';
import LineChart from './LineChart';
import VolumeChart from './VolumeChart';
import { CustomTooltip, VolumeTooltip } from './Tooltips';
import { fetchStockData } from './dataService';

// メインコンポーネント
const StockChart = ({
  initialSymbol = 'N225',
  initialTimeRange = '3mo',
  initialChartType = 'candlestick',
  showSMA5 = true,
  showSMA25 = true,
  showSMA75 = true,
  showBollingerBands = true,
  showBollingerBands3 = false // デフォルトでは非表示
}) => {
  const [stockData, setStockData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState(null);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [chartType, setChartType] = useState(initialChartType);
  const [showSMA, setShowSMA] = useState({
    sma5: showSMA5,
    sma25: showSMA25,
    sma75: showSMA75
  });
  const [showBB, setShowBB] = useState(showBollingerBands);
  const [showBB3, setShowBB3] = useState(showBollingerBands3); // 標準偏差3倍のボリンジャーバンド表示設定
  const [lastPrice, setLastPrice] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [prevPrice, setPrevPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const containerRef = useRef(null);

  // 数値をフォーマットする関数
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  // 利用可能な銘柄を取得
  const symbols = [
    {"value": "N225", "label": "日経平均株価 (N225)"},
    {"value": "7203.T", "label": "トヨタ自動車 (7203.T)"},
    {"value": "9984.T", "label": "ソフトバンクグループ (9984.T)"},
    {"value": "6758.T", "label": "ソニーグループ (6758.T)"},
    {"value": "8306.T", "label": "三菱UFJフィナンシャル (8306.T)"},
    {"value": "USDJPY", "label": "米ドル/円 (USD/JPY)"},
    {"value": "EURJPY", "label": "ユーロ/円 (EUR/JPY)"},
    {"value": "GBPJPY", "label": "英ポンド/円 (GBP/JPY)"},
    {"value": "EURUSD", "label": "ユーロ/米ドル (EUR/USD)"},
    {"value": "GBPUSD", "label": "英ポンド/米ドル (GBP/USD)"},
  ];

  // 初期ロード時とシンボル・期間変更時のデータ取得
  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching data for ${symbol} with timeRange ${timeRange}`);
        const token = localStorage.getItem('token');

        const data = await fetchStockData(token, {
          symbol,
          timeRange,
          chartType,
          showSMA5: showSMA.sma5,
          showSMA25: showSMA.sma25,
          showSMA75: showSMA.sma75,
          showBollingerBands: showBB,
          showBollingerBands3: showBB3
        });

        console.log(`Received ${data.priceData.length} data points for ${symbol}`);

        setStockData(data.priceData);
        setVolumeData(data.volumeData);
        setLastPrice(data.lastPrice);
        setPrevPrice(data.prevPrice);
        setPriceChange(data.priceChange);
        setPriceChangePercent(data.priceChangePercent);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`データの取得に失敗しました: ${err.message}`);

        // 空のデータセットで初期化
        setStockData([]);
        setVolumeData([]);
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [symbol, timeRange, chartType, showSMA.sma5, showSMA.sma25, showSMA.sma75, showBB, showBB3]);

  // エラー表示
  if (errorMsg) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', bgcolor: 'grey.100' }}>
        <Box sx={{ textAlign: 'center', maxWidth: '80%' }}>
          <Typography color="error.main" variant="h6" gutterBottom>エラーが発生しました</Typography>
          <Typography color="text.secondary" paragraph>{errorMsg}</Typography>
          <Button variant="contained" color="primary" onClick={() => {
            // 再フェッチ
            setLoading(true);
            setError(null);
            const loadStockData = async () => {
              try {
                const token = localStorage.getItem('token');
                const data = await fetchStockData(token, {
                  symbol,
                  timeRange,
                  chartType,
                  showSMA5: showSMA.sma5,
                  showSMA25: showSMA.sma25,
                  showSMA75: showSMA.sma75,
                  showBollingerBands: showBB,
                  showBollingerBands3: showBB3
                });
                setStockData(data.priceData);
                setVolumeData(data.volumeData);
                setLastPrice(data.lastPrice);
                setPrevPrice(data.prevPrice);
                setPriceChange(data.priceChange);
                setPriceChangePercent(data.priceChangePercent);
              } catch (err) {
                setError(`データの取得に失敗しました: ${err.message}`);
                setStockData([]);
                setVolumeData([]);
              } finally {
                setLoading(false);
              }
            };
            loadStockData();
          }}>
            再試行
          </Button>
        </Box>
      </Box>
    );
  }

  // ローディング表示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'grey.100' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="text.secondary">データを読み込み中...</Typography>
        </Box>
      </Box>
    );
  }

  // 銘柄表示名を取得
  const getSymbolDisplayName = () => {
    const symbolObj = symbols.find(s => s.value === symbol);
    return symbolObj ? symbolObj.label.split(' ')[0] : symbol;
  };

  const isPositiveChange = priceChange >= 0;

  return (
    <Box sx={{ bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, p: 3 }} ref={containerRef}>
      {/* ヘッダー部分 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2
        }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {getSymbolDisplayName()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(lastPrice.toFixed(2))}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="semibold"
                sx={{
                  ml: 1.5,
                  color: isPositiveChange ? 'success.main' : 'error.main'
                }}
              >
                {isPositiveChange ? '+' : ''}{formatNumber(priceChange.toFixed(2))} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: { xs: 2, sm: 0 } }}>
            {['1mo', '3mo', '6mo', '1y', '5y'].map((period) => (
              <Button
                key={period}
                variant={timeRange === period ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                onClick={() => setTimeRange(period)}
              >
                {period.replace('mo', 'M').replace('y', 'Y')}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <Select
            size="small"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            {symbols.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <MenuItem value="candlestick">ローソク足</MenuItem>
            <MenuItem value="line">ライン</MenuItem>
          </Select>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showSMA.sma5}
                onChange={() => setShowSMA({ ...showSMA, sma5: !showSMA.sma5 })}
              />
            }
            label="SMA(5)"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showSMA.sma25}
                onChange={() => setShowSMA({ ...showSMA, sma25: !showSMA.sma25 })}
              />
            }
            label="SMA(25)"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showSMA.sma75}
                onChange={() => setShowSMA({ ...showSMA, sma75: !showSMA.sma75 })}
              />
            }
            label="SMA(75)"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showBB}
                onChange={() => setShowBB(!showBB)}
              />
            }
            label="BB(2σ)"
          />

          {/* 標準偏差3倍のボリンジャーバンドのチェックボックス */}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showBB3}
                onChange={() => setShowBB3(!showBB3)}
              />
            }
            label="BB(3σ)"
          />
        </Box>
      </Box>

      {/* チャート部分 */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ height: 320 }}>
          {chartType === 'line'
            ? <LineChart
                stockData={stockData}
                showSMA={showSMA}
                showBB={showBB}
                showBB3={showBB3}
                formatNumber={formatNumber}
                CustomTooltip={CustomTooltip}
              />
            : <CandlestickChart
                stockData={stockData}
                showSMA={showSMA}
                showBB={showBB}
                showBB3={showBB3}
                formatNumber={formatNumber}
                CustomTooltip={CustomTooltip}
                containerRef={containerRef}
              />
          }
        </Box>
      </Box>

      {/* 出来高チャート */}
      <Box sx={{ height: 128 }}>
        <VolumeChart
          volumeData={volumeData}
          formatNumber={formatNumber}
          VolumeTooltip={VolumeTooltip}
        />
      </Box>

      {/* フッター部分 */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        ※ このチャートはAlpha VantageとYahoo Financeから取得した実際のデータを使用しています。
      </Typography>
    </Box>
  );
};

// PropTypes定義 - メインコンポーネントのみ定義
StockChart.propTypes = {
  initialSymbol: PropTypes.string,
  initialTimeRange: PropTypes.string,
  initialChartType: PropTypes.string,
  showSMA5: PropTypes.bool,
  showSMA25: PropTypes.bool,
  showSMA75: PropTypes.bool,
  showBollingerBands: PropTypes.bool,
  showBollingerBands3: PropTypes.bool // 標準偏差3倍のボリンジャーバンド表示設定
};

export default StockChart;