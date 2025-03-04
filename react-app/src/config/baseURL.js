// 環境に応じて API のベース URL を設定する

// ローカル環境かどうかを判定
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 現在のプロトコルを取得（http: または https:）
const protocol = window.location.protocol;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

const API_BASE_URL = isLocal
  ? 'http://localhost:8000'  // ローカル環境
  : `${protocol}//maruomosquit.com`; // 本番環境（現在のプロトコルを使用）

export const WS_BASE_URL = isLocal
  ? 'ws://localhost:8000'
  : `${wsProtocol}//maruomosquit.com`;

export default API_BASE_URL;
