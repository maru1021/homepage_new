// 環境に応じて API のベース URL を設定する

// ローカル環境かどうかを判定
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Codespaces時のURL を取得
const isCodespace = window.location.hostname.endsWith(".github.dev");
const codespaceURL = isCodespace ? `https://${window.location.hostname}/8000` : null;

const API_BASE_URL = isLocal
  ? process.env.REACT_APP_API_BASE_URL  // ローカル環境
  : codespaceURL || process.env.REACT_APP_API_BASE_URL_PRODUCTION; // Codespaces または本番

export default API_BASE_URL;
