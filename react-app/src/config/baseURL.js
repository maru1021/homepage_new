// 環境に応じて API のベース URL を設定する

// ローカル環境かどうかを判定
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocal
  ? process.env.REACT_APP_API_BASE_URL  // ローカル環境
  : process.env.REACT_APP_API_BASE_URL_PRODUCTION; // Codespaces または本番

export default API_BASE_URL;
