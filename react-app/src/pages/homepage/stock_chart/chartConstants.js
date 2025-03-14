// チャート関連の定数

// チャートタイプ
export const CHART_TYPES = {
  CANDLESTICK: 'candlestick',
  LINE: 'line'
};

// 時間範囲オプション
export const TIME_RANGES = {
  ONE_MONTH: '1mo',
  THREE_MONTHS: '3mo',
  SIX_MONTHS: '6mo',
  ONE_YEAR: '1y',
  FIVE_YEARS: '5y'
};

// 表示オプションのデフォルト値
export const DEFAULT_OPTIONS = {
  SHOW_SMA5: true,
  SHOW_SMA25: true,
  SHOW_SMA75: true,
  SHOW_BOLLINGER_BANDS: true,
  SHOW_BOLLINGER_BANDS3: false
};

// チャートの色設定
export const CHART_COLORS = {
  SMA5: '#ff9800',
  SMA25: '#42a5f5',
  SMA75: '#9c27b0',
  BOLLINGER_BANDS: '#9fa8da',
  BOLLINGER_BANDS3: '#e57373',
  PRICE_LINE: '#ff7043',
  VOLUME_UP: '#26A69A',
  VOLUME_DOWN: '#EF5350',
  REFERENCE_LINE: '#888888'
};