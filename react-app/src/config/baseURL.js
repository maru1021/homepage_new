// 環境に応じて API のベース URL を設定する

// ローカル環境かどうかを判定
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocal
  ? 'http://localhost:8000'  // ローカル環境
  : 'https://maruomosquit.com'; // 本番環境

export default API_BASE_URL;
