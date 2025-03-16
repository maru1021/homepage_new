import API_BASE_URL from '../../../../src/config/baseURL';

// 利用可能な銘柄を取得する関数
export const fetchSymbols = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/stock_chart/symbols`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('シンボルの取得に失敗しました');
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching symbols:', err);
    throw err;
  }
};

// 株価データを取得する関数
export const fetchStockData = async (token, params) => {
  try {
    const {
      symbol,
      timeRange,
      chartType,
      showSMA5,
      showSMA25,
      showSMA75,
      showBollingerBands,
      showBollingerBands3
    } = params;

    const response = await fetch(`${API_BASE_URL}/public/stock_chart/stock-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol,
        timeRange,
        chartType,
        showSMA5,
        showSMA25,
        showSMA75,
        showBollingerBands,
        showBollingerBands3
      })
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || `エラー: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = `エラー: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // データが期待通りの形式かチェック
    if (!data.priceData || !Array.isArray(data.priceData) || data.priceData.length === 0) {
      throw new Error('取得したデータが不正な形式です');
    }

    return data;
  } catch (err) {
    console.error('Error fetching stock data:', err);
    throw err;
  }
};

// 数値をフォーマットする関数
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ja-JP').format(num);
};