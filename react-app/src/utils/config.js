const isDevelopment = process.env.NODE_ENV === 'development';

// APIのベースURLとパスプレフィックスを設定
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:8000'  // 開発環境
  : 'https://maruomosquit.com';  // 本番環境
