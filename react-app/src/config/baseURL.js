// 環境に応じて API のベース URL を設定する

// ローカル環境かどうかを判定
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// APIのベースURL
export const API_BASE_URL = isLocal
  ? 'http://localhost:8000'  // ローカル環境
  : 'https://maruomosquit.com'; // 本番環境は常にHTTPS

// WebSocketのベースURL
export const WS_BASE_URL = isLocal
  ? 'ws://localhost:8000'  // ローカル環境
  : 'wss://maruomosquit.com'; // 本番環境は常にWSS

// 後方互換性のために default export も維持
export default API_BASE_URL;
